import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/app/api/mcp/_require-admin";
import { loadAiSettings, resolveApiKey, computeCost } from "@/lib/ai/settings";
import { ANALYTICS_TOOL_NAMES, CONTENT_TOOL_NAME, openAiToolsList, parseToolArgs, normalizeArgs } from "@/lib/ai/tools";

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
// The provider fetch has no timeout of its own; an overdue model call would
// otherwise dead-end the stream after `meta` with no error event. Cap the whole
// request so the catch below can surface a real error and record a failure.
const UPSTREAM_TIMEOUT_MS = 90_000;

/**
 * read-only content_library tool: every authored item (slug, id, title, whether
 * it has a meta description) joined to last-30-day view counts so the assistant
 * can answer content/SEO questions and point to the right editor — never write.
 */
async function runContentLibrary(client: any): Promise<{ ok: boolean; preview: string }> {
  try {
    const now = new Date();
    const from = new Date(now.getTime() - 30 * 86_400_000).toISOString();
    const [posts, cases, resources, top] = await Promise.all([
      client.from("blog_posts").select("id, slug, title, meta_description, published").limit(300),
      client.from("case_studies").select("id, slug, title, meta_description").limit(300),
      client.from("resources").select("id, slug, title, meta_description").limit(300),
      client.rpc("analytics_top_content", { p_from: from, p_to: now.toISOString(), p_include_internal: false }),
    ]);
    const viewMap = new Map<string, number>((top ?? []).map((r: any) => [String(r.slug), r.views ?? 0]));
    const item = (type: string, r: any) => ({
      type,
      id: r.id,
      slug: r.slug,
      title: r.title ?? "",
      has_meta: !!r.meta_description,
      published: r.published ?? null,
      views30d: r.slug ? (viewMap.get(r.slug) ?? 0) : 0,
    });
    const library = [
      ...(posts.data ?? []).map((r: any) => item("blog_post", r)),
      ...(cases.data ?? []).map((r: any) => item("case_study", r)),
      ...(resources.data ?? []).map((r: any) => item("resource", r)),
    ];
    return { ok: true, preview: JSON.stringify(library) };
  } catch (e) {
    return { ok: false, preview: `content_library error: ${e instanceof Error ? e.message : String(e)}` };
  }
}

function SYSTEM_PROMPT(today: string): string {
  return [
    "You are the Regent analytics assistant for the Regent website admin dashboard.",
    `Today's date is ${today} (UTC).`,
    "You answer questions about the site's content analytics, traffic, conversions, and content quality by calling the analytics_* tools (live Supabase data) and the content_library tool (the actual list of posts, case studies and resources).",
    "Rules:",
    "- Always answer in Markdown. Use a table when returning more than one row of data, short bullets otherwise.",
    "- The analytics tools default to the last 30 days and exclude internal traffic unless the user asks for a different window.",
    "- Never invent numbers: report exactly what the tools return. If a tool errors, say so plainly.",
    "- For content/SEO questions (which pages underperform, who lacks a meta description, what to write next), call content_library and reference real titles and slugs.",
    "- You may suggest edits to published content (better meta description, section suggestions, SEO fixes) and refer the admin to the editor, e.g. the editor page for a post. You are read-only — never claim a change was made.",
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
  // A trimmed window must never start on an orphan: step past a leading tool
  // row, or an assistant row whose tool_calls would arrive without their tool
  // results (the round was cut by the slice). Sending either upstream throws
  // the model off — it repeats the same calls, one of the failure loops seen.
  while (
    historyRows.length &&
    (historyRows[0].role === "tool" ||
      (historyRows[0].role === "assistant" &&
        Array.isArray(historyRows[0].tool_calls) &&
        historyRows[0].tool_calls.length > 0))
  ) {
    historyRows.shift();
  }
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

      // Hard cap on the whole request so a hung provider cannot dead-end the
      // stream (see UPSTREAM_TIMEOUT_MS). Declared outside the try/catch so the
      // catch can read its aborted state to give a clear timeout message.
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(
        () => timeoutController.abort(new Error("AI provider timed out")),
        UPSTREAM_TIMEOUT_MS
      );
      const runToolCall = async (call: { function: { name: string; arguments: string } }) => {
        const name = call.function.name;
        const args = normalizeArgs(parseToolArgs(call.function.arguments));
        let ok = false;
        let preview = "";
        if (name === CONTENT_TOOL_NAME) {
          const result = await runContentLibrary(supabase);
          ok = result.ok;
          preview = result.preview;
        } else if (!(ANALYTICS_TOOL_NAMES as readonly string[]).includes(name)) {
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
      };

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
            signal: AbortSignal.any([req.signal, timeoutController.signal]),
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

            // Run the round's RPCs in call order, deduping identical (tool,
            // normalized args) pairs: the model sometimes re-issues the same
            // analytics call two or three times (a hung transcript shows
            // analytics_daily ×3 in one round). One RPC, shared result — each
            // call id still gets a tool message so the round stays valid.
            type ToolResult = { name: string; args: Record<string, unknown>; ok: boolean; preview: string };
            const seen: Map<string, ToolResult> = new Map();
            for (let i = 0; i < finalCalls.length; i++) {
              const call = finalCalls[i];
              const key = `${call.function.name}|${JSON.stringify(normalizeArgs(parseToolArgs(call.function.arguments)))}`;
              let result = seen.get(key);
              if (!result) {
                result = await runToolCall(call);
                seen.set(key, result);
              }
              roundToolMsgs[i].content = result.preview;
              send("tool_result", { tool: result.name, ok: result.ok, preview: result.preview.slice(0, 500) });
              toolEvents.push({ tool: result.name, args: result.args, ok: result.ok, preview: result.preview.slice(0, 200) });
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
          clearTimeout(timeoutId);
          send("done", {});
          controller.close();
          return;
        }

        // Exhausted tool rounds without a final answer.
        throw new Error("Assistant exceeded the maximum tool-call rounds.");
      } catch (err) {
        clearTimeout(timeoutId);
        const message = timeoutController.signal.aborted
          ? "AI provider timed out after 90s — the model did not respond in time. Try again."
          : err instanceof Error
            ? err.message
            : "AI request failed";
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
