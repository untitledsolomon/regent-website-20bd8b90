import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/app/api/mcp/_require-admin";
import { loadAiSettings, resolveApiKey, computeCost } from "@/lib/ai/settings";
import { ANALYTICS_TOOL_NAMES, openAiToolsList, parseToolArgs, normalizeArgs } from "@/lib/ai/tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  conversation_id: z.string().uuid().optional(),
  message: z.string().min(1).max(8000),
  feature: z.enum(["analytics_assistant", "general_chat"]).default("analytics_assistant"),
});

// OpenAI-style chat messages as stored / sent; tool results flattened to text.
interface ChatMsg {
  role: "user" | "assistant" | "tool" | "system";
  content: string | null;
  tool_calls?: Array<{ id: string; type: "function"; function: { name: string; arguments: string } }>;
  tool_call_id?: string;
  name?: string;
}

const MAX_TOOL_ROUNDS = 6;
const MAX_HISTORY_ROWS = 30;
const TOOL_RESULT_LIMIT = 3000;

function SYSTEM_PROMPT(today: string): string {
  return [
    "You are the Regent analytics assistant for the Regent website admin dashboard.",
    `Today's date is ${today} (UTC).`,
    "You answer questions about the site's content analytics, traffic, and conversions by calling the analytics_* tools, which query live Supabase data.",
    "Rules:",
    "- Always answer in Markdown. Use a table when returning more than one row of data, short bullets otherwise.",
    "- The analytics tools default to the last 30 days and exclude internal traffic unless the user asks for a different window.",
    "- Never invent numbers: report exactly what the tools return. If a tool errors, say so plainly.",
    "- Call the fewest tools needed to answer, and prefer one combined query over several.",
    "- Keep answers concise and actionable; lead with the key finding.",
  ].join("\n");
}

export async function POST(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "AI unavailable: Supabase credentials not configured" }, { status: 503 });
  }
  // Auth and settings reads are independent — resolve in parallel.
  const [guard, settings] = await Promise.all([requireAdmin(), loadAiSettings()]);
  if (guard instanceof NextResponse) return guard;
  const uid = guard.uid;

  if (!settings) return NextResponse.json({ error: "AI settings not initialized" }, { status: 404 });
  if (!settings.enabled) return NextResponse.json({ error: "AI is disabled in settings" }, { status: 423 });
  const apiKey = await resolveApiKey(settings);
  if (!apiKey) return NextResponse.json({ error: "No API key configured — set it in AI settings" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  const { conversation_id, message, feature } = parsed.data;

  const supabase = createServiceClient();
  const cookie = await createClient();

  // Resolve the conversation (create on first message), always the caller's own.
  let convId = conversation_id;
  if (convId) {
    const { data: conv, error } = await (supabase as any).from("ai_conversations").select("user_id").eq("id", convId).maybeSingle();
    if (error || !conv || conv.user_id !== uid) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
  }
  if (!convId) {
    const { data: conv, error } = await (supabase as any)
      .from("ai_conversations")
      .insert({ user_id: uid, title: message.slice(0, 60), feature })
      .select("id")
      .single();
    if (error || !conv) {
      console.error("Error creating conversation:", error);
      return NextResponse.json({ error: error?.message ?? "Failed to create conversation" }, { status: 500 });
    }
    convId = conv.id;
  }

  const { error: userErr } = await (supabase as any).from("ai_messages").insert({
    conversation_id: convId, role: "user", content: message,
  });
  if (userErr) {
    console.error("Error saving user message:", userErr);
    return NextResponse.json({ error: userErr.message }, { status: 500 });
  }

  // Load recent history as OpenAI chat messages (tool outputs flattened to
  // text). Cap the payload so long chats stay fast and cheap; step past a
  // leading tool row so a half-finished tool round is never sent (the
  // assistant tool_calls row that owns it was trimmed away).
  const { data: history } = await (supabase as any)
    .from("ai_messages")
    .select("role, content, tool_calls, tool_name, tool_call_id")
    .eq("conversation_id", convId)
    .order("created_at", { ascending: true });
  const historyRows = (history ?? []).slice(-MAX_HISTORY_ROWS);
  while (historyRows.length && historyRows[0].role === "tool") historyRows.shift();
  const msgs: ChatMsg[] = [];
  for (const row of historyRows) {
    if (row.role === "tool") {
      msgs.push({ role: "tool", content: row.content ?? "", name: row.tool_name, tool_call_id: row.tool_call_id ?? `tc_${msgs.length}` });
    } else if (row.role === "assistant") {
      msgs.push({ role: "assistant", content: row.content, tool_calls: row.tool_calls ?? undefined });
    } else {
      msgs.push({ role: "user", content: row.content });
    }
  }
  msgs.unshift({ role: "system", content: SYSTEM_PROMPT(new Date().toISOString().slice(0, 10)) });

  const started = Date.now();
  const encoder = new TextEncoder();
  const isAnalytics = feature === "analytics_assistant";
  const tools = isAnalytics ? openAiToolsList() : [];

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          /* client gone */
        }
      };

      let toolEvents: Array<{ tool: string; args: unknown; ok: boolean; preview: string }> = [];

      send("meta", { conversation_id: convId, model: settings.model, feature });

      try {
        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          const payload: Record<string, unknown> = {
            model: settings.model,
            messages: msgs,
            stream: true,
            temperature: Number(settings.temperature),
            max_tokens: settings.max_tokens,
            stream_options: { include_usage: true },
          };
          if (tools.length) payload.tools = tools;

          const upstream = await fetch(`${settings.base_url.replace(/\/$/, "")}/chat/completions`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify(payload),
            signal: req.signal,
          });
          if (!upstream.ok) {
            const errText = await upstream.text().catch(() => "");
            throw new Error(`Upstream ${upstream.status}: ${errText.slice(0, 300)}`);
          }
          if (!upstream.body) throw new Error("Upstream returned no body");

          const reader = upstream.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let content = "";
          let usage: Record<string, number> | null = null;
          const toolCalls: Map<number, { id?: string; name?: string; arguments?: string }> = new Map();
          let finishReason: string | null = null;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const data = trimmed.slice(5).trim();
              if (data === "[DONE]") continue;

              let chunk: any;
              try {
                chunk = JSON.parse(data);
              } catch {
                continue;
              }
              if (chunk.usage) usage = { ...chunk.usage, ...(chunk.usage.prompt_tokens_details ?? {}) };
              if (chunk.choices?.[0]) {
                const choice = chunk.choices[0];
                if (choice.finish_reason) finishReason = choice.finish_reason;
                const delta = choice.delta ?? {};
                if (delta.content) {
                  content += delta.content;
                  send("token", { text: delta.content });
                }
                for (const tc of delta.tool_calls ?? []) {
                  const idx = tc.index ?? 0;
                  const cur = toolCalls.get(idx) ?? {};
                  if (tc.id) cur.id = tc.id;
                  if (tc.function?.name) cur.name = (cur.name ?? "") + tc.function.name;
                  if (tc.function?.arguments) cur.arguments = (cur.arguments ?? "") + tc.function.arguments;
                  toolCalls.set(idx, cur);
                }
              }
            }
          }

          const finalCalls = Array.from(toolCalls.entries())
            .sort((a, b) => a[0] - b[0])
            .filter(([, c]) => c.name)
            .map(([, c]) => ({
              id: c.id ?? `call_${Math.random().toString(36).slice(2, 10)}`,
              type: "function" as const,
              function: { name: c.name!, arguments: c.arguments ?? "{}" },
            }));

          if (finishReason === "tool_calls" && finalCalls.length) {
            msgs.push({ role: "assistant", content: content || null, tool_calls: finalCalls });
            const roundToolMsgs = finalCalls.map((call) => ({ role: "tool" as const, content: "", tool_call_id: call.id }));

            // Run the round's RPCs concurrently; results are emitted and stored in call order.
            const results = await Promise.all(
              finalCalls.map(async (call) => {
                const name = call.function.name;
                const valid = ANALYTICS_TOOL_NAMES.includes(name as (typeof ANALYTICS_TOOL_NAMES)[number]);
                const args = normalizeArgs(parseToolArgs(call.function.arguments));
                let ok = false;
                let preview = "";
                if (!valid) {
                  preview = `Unknown tool: ${name}`;
                } else {
                  try {
                    const { data: result, error: rpcError } = await (cookie as any).rpc(name, args);
                    if (rpcError) {
                      preview = `RPC error: ${rpcError.message}`;
                    } else {
                      ok = true;
                      const text = JSON.stringify(result);
                      preview = text.length > TOOL_RESULT_LIMIT ? `${text.slice(0, TOOL_RESULT_LIMIT)}… (truncated)` : text;
                    }
                  } catch (e) {
                    preview = `Tool error: ${e instanceof Error ? e.message : String(e)}`;
                  }
                }
                return { name, args, ok, preview };
              })
            );

            for (let i = 0; i < results.length; i++) {
              const res = results[i];
              roundToolMsgs[i].content = res.preview;
              send("tool_result", { tool: res.name, ok: res.ok, preview: res.preview.slice(0, 500) });
              toolEvents.push({ tool: res.name, args: res.args, ok: res.ok, preview: res.preview.slice(0, 200) });
            }
            // Persist assistant(tool_calls) + tool messages, then relay to model.
            await (supabase as any).from("ai_messages").insert(
              [{ conversation_id: convId, role: "assistant", content: content || null, tool_calls: finalCalls }, ...roundToolMsgs.map((m, i) => ({ conversation_id: convId, role: m.role, content: m.content, tool_name: finalCalls[i].function.name, tool_call_id: m.tool_call_id }))]
            );
            msgs.push(...roundToolMsgs.map((m) => ({ role: "tool" as const, content: m.content, tool_call_id: m.tool_call_id })));
            continue;
          }

          // Natural-language finish.
          const cost = computeCost(
            {
              prompt_tokens: usage?.prompt_tokens ?? 0,
              completion_tokens: usage?.completion_tokens ?? 0,
              cached_tokens: usage?.prompt_cache_hit_tokens ?? usage?.cached_tokens ?? 0,
              total_tokens: usage?.total_tokens ?? (usage?.prompt_tokens ?? 0) + (usage?.completion_tokens ?? 0),
            },
            settings
          );
          await (supabase as any).from("ai_usage").insert({
            user_id: uid,
            feature,
            provider: settings.provider,
            model: settings.model,
            prompt_tokens: usage?.prompt_tokens ?? 0,
            completion_tokens: usage?.completion_tokens ?? 0,
            cached_tokens: usage?.prompt_cache_hit_tokens ?? usage?.cached_tokens ?? 0,
            total_tokens: usage?.total_tokens ?? 0,
            cost: cost.cost_total,
            price_input_per_mtok: settings.price_input_per_mtok,
            price_output_per_mtok: settings.price_output_per_mtok,
            price_input_cached_per_mtok: settings.price_input_cached_per_mtok,
            currency: settings.currency,
            latency_ms: Date.now() - started,
            success: true,
          });

          const assistantContent = content?.trim() || "(no reply)";
          await (supabase as any).from("ai_messages").insert({
            conversation_id: convId,
            role: "assistant",
            content: assistantContent,
            tool_events: toolEvents.length ? toolEvents : null,
          });
          await (supabase as any).from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
          send("done", {});
          controller.close();
          return;
        }

        // Exhausted tool rounds without a final answer.
        throw new Error("Assistant exceeded the maximum tool-call rounds.");
      } catch (err) {
        const message = err instanceof Error ? err.message : "AI request failed";
        if (message !== "Assistant exceeded the maximum tool-call rounds.") {
          // Log failures to the usage ledger too.
          await (supabase as any).from("ai_usage").insert({
            user_id: uid, feature, provider: settings.provider, model: settings.model,
            prompt_tokens: 0, completion_tokens: 0, cached_tokens: 0, total_tokens: 0, cost: 0,
            currency: settings.currency, latency_ms: Date.now() - started, success: false, error: message.slice(0, 2000),
          }).catch(() => {});
        }
        send("error", { message });
        controller.close();
      }
    },
    cancel() {
      /* client aborted */
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
