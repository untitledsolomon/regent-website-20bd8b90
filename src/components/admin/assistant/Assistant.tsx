"use client";

// WS5: Admin analytics assistant. Plain React (no query lib): conversations
// list + message history load via fetch, runs stream against /api/admin/ai/chat
// (SSE), renders streaming tokens and tool-call cards as they arrive.

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Bot, User, Send, Plus, Trash2, Wrench, Square, ChevronDown, ChevronUp } from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  feature: string;
  created_at: string;
  updated_at: string;
}

interface ToolCallUi {
  tool: string;
  ok: boolean;
  preview: string;
  expanded: boolean;
}

interface MessageUi {
  id: string;
  role: "user" | "assistant";
  content: string;
  stream?: boolean;
  toolCalls?: ToolCallUi[];
  rawToolEvents?: Array<{ tool: string; args: unknown; ok: boolean; preview: string }>;
}

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

const SUGGESTED_PROMPTS = [
  "What were our top posts this month?",
  "Show the conversion funnel, last 30 days.",
  "Any new consultation requests or subscribers?",
];

export default function Assistant() {
  const queryClient = useQueryClient();
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageUi[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modelName, setModelName] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const loadedConversationsRef = useRef<string | null>(null);

  // Conversation list is cached — returning to this tab does not refetch;
  // sending a message or deleting invalidates the key.
  const conversationsQuery = useQuery({
    queryKey: ["admin", "ai", "conversations"],
    staleTime: 60_000,
    queryFn: async (): Promise<Conversation[]> => {
      const res = await fetch("/api/admin/ai/conversations");
      if (!res.ok) return [];
      const data = await res.json();
      return data.conversations ?? [];
    },
  });
  const conversations = conversationsQuery.data ?? [];
  const loadConversations = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin", "ai", "conversations"] });
  }, [queryClient]);

  useEffect(() => {
    if (!currentId) return;
    if (loadedConversationsRef.current === currentId) return;
    loadedConversationsRef.current = currentId;
    setMessages([]);
    setHistoryLoaded(false);
    setError(null);
    (async () => {
      try {
        const res = await fetch(`/api/admin/ai/conversations/${currentId}/messages`);
        if (!res.ok) return;
        const data = await res.json();
        setMessages(
          (data.messages ?? [])
            .filter((m: any) => m.role === "user" || m.role === "assistant")
            .map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content ?? "",
              rawToolEvents: m.tool_events ?? undefined,
              toolCalls: (m.tool_events ?? []).map((t: any) => ({ tool: t.tool, ok: t.ok, preview: t.preview, expanded: false })),
            }))
        );
      } finally {
        setHistoryLoaded(true);
      }
    })();
  }, [currentId]);

  // Auto-scroll (instant) only while the reader is near the bottom; never yank
  // the viewport mid-stream if they scrolled up to read.
  useEffect(() => {
    const sentinel = bottomRef.current;
    if (!sentinel) return;
    const container = sentinel.closest("[data-radix-scroll-area-viewport]");
    if (!container) return;
    const gap = container.getBoundingClientRect().bottom - sentinel.getBoundingClientRect().bottom;
    if (gap < 120) sentinel.scrollIntoView({ block: "end" });
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const startNew = () => {
    abortRef.current?.abort();
    setCurrentId(null);
    loadedConversationsRef.current = null;
    setMessages([]);
    setHistoryLoaded(true);
    setError(null);
  };

  const selectConversation = (id: string) => {
    if (streaming) return;
    abortRef.current?.abort();
    setCurrentId(id);
  };

  const send = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || streaming) return;
    setInput("");
    setError(null);
    setHistoryLoaded(true);

    const userMsg: MessageUi = { id: `u_${Date.now()}`, role: "user", content: text };
    const assistantId = `a_${Date.now()}`;
    const draft: MessageUi = { id: assistantId, role: "assistant", content: "", stream: true, toolCalls: [] };
    setMessages((m) => [...m, userMsg, draft]);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/admin/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: currentId ?? undefined, message: text }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      if (!res.body) throw new Error("No response stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const update = (fn: (prev: MessageUi) => MessageUi) => {
        setMessages((ms) => ms.map((m) => (m.id === assistantId ? fn(m) : m)));
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() ?? "";
        for (const block of blocks) {
          const lines = block.split("\n");
          const dataLine = lines.find((l) => l.startsWith("data:"));
          if (!dataLine) continue;
          let data: any;
          try { data = JSON.parse(dataLine.slice(5).trim()); } catch { continue; }

          if (data.text !== undefined) {
            update((p) => ({ ...p, content: p.content + data.text }));
          } else if (data.tool !== undefined) {
            // Append live so every tool card in a round is kept (not just the last).
            update((p) => ({
              ...p,
              toolCalls: [...(p.toolCalls ?? []), { tool: data.tool, ok: data.ok, preview: data.preview ?? "", expanded: false }],
            }));
          } else if (data.conversation_id) {
            setCurrentId(data.conversation_id);
            if (data.model) setModelName(data.model);
          }
        }
      }
      update((p) => {
        const isDone = p.content.trim().length > 0 || (p.toolCalls?.length ?? 0) > 0;
        return { ...p, stream: false, content: p.content.trim() || (p.toolCalls?.length ? "" : "(no reply)"), toolCalls: p.toolCalls };
      });
      loadConversations();
    } catch (e) {
      if (!controller.signal.aborted) {
        const msg = e instanceof Error ? e.message : "Request failed";
        setError(msg);
        setMessages((ms) => ms.map((m) =>
          m.id === assistantId ? { ...m, stream: false, content: m.content || `⚠ ${msg}` } : m
        ));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    // Freeze the streaming bubble so it stops rendering the caret.
    setMessages((ms) => ms.map((m) => (m.stream ? { ...m, stream: false } : m)));
  };

  const deleteConversation = async (id: string) => {    try {
      await fetch(`/api/admin/ai/conversations/${id}`, { method: "DELETE" });
      if (currentId === id) startNew();
      loadConversations();
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Conversation sidebar */}
      {sidebarOpen && (
        <div className="w-72 shrink-0 rounded-xl border bg-card flex flex-col">
          <div className="p-3 border-b flex justify-between items-center">
            <Button size="sm" variant="outline" onClick={startNew} className="w-full">
              <Plus size={16} className="mr-1" /> New conversation
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setSidebarOpen(false)}>
              <ChevronDown size={16} />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "group flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm cursor-pointer",
                    currentId === c.id ? "bg-primary/10 text-primary" : "hover:bg-muted/60"
                  )}
                  onClick={() => selectConversation(c.id)}
                >
                  <span className="flex-1 truncate">{c.title}</span>
                  <span className="text-[10px] text-muted-foreground">{fmt(c.updated_at)}</span>
                  <button
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                    aria-label="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {conversations.length === 0 && (
                <p className="text-xs text-muted-foreground px-2 py-4 text-center">No conversations yet</p>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Main chat */}
      <div className="flex-1 rounded-xl border bg-card flex flex-col min-w-0">
        <div className="p-3 border-b flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <span className="font-medium">Analytics Assistant</span>
            {modelName && <Badge variant="secondary" className="text-[10px]">{modelName}</Badge>}
          </div>
          <Button size="icon" variant="ghost" onClick={() => setSidebarOpen((v) => !v)} aria-label="Toggle conversations">
            <ChevronUp size={16} className={cn(sidebarOpen && "rotate-180 transition")} />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-4 p-4">
            {messages.length === 0 && historyLoaded && !streaming && (
              <div className="text-center py-16 space-y-2">
                <Bot size={40} className="mx-auto text-muted-foreground/40" />
                <p className="font-medium">Ask about your Regent traffic</p>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => send(p)}
                      className="text-xs rounded-full border bg-muted/40 px-3 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <MessageBubble key={m.id} msg={m} />
            ))}

            {error && (
              <div className="text-sm text-destructive bg-destructive/5 rounded-lg px-3 py-2">{error}</div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <div className="p-3 border-t">
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-end gap-2"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask about traffic, engagement, conversions…"
              rows={Math.min(8, Math.max(1, input.split("\n").length))}
              className="resize-none"
              disabled={streaming}
              maxLength={8000}
            />
            {streaming ? (
              <Button type="button" size="icon" variant="outline" onClick={stop} aria-label="Stop generating">
                <Square size={16} />
              </Button>
            ) : (
              <Button type="submit" size="icon" disabled={!input.trim()}>
                <Send size={16} />
              </Button>
            )}
          </form>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            The assistant answers from live Supabase analytics — same data as the MCP tools and dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

function ToolCard({ tool, ok, preview }: { tool: string; ok: boolean; preview: string }) {
  // Each card owns its expanded state so toggling one never opens the rest.
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-lg border bg-muted/30 p-2.5 mt-2">
      <button type="button" onClick={() => setExpanded((v) => !v)} className="flex items-center gap-2 text-xs w-full text-left">
        <Wrench size={12} className={ok ? "text-primary" : "text-destructive"} />
        <span className="font-mono font-medium">{tool}</span>
        {ok ? <Badge variant="outline" className="text-[10px]">ok</Badge> : <Badge variant="destructive" className="text-[10px]">error</Badge>}
        <span className="ml-auto">{expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}</span>
      </button>
      {expanded && <pre className="mt-1.5 text-[11px] text-muted-foreground whitespace-pre-wrap font-mono break-words pl-4">{preview.slice(0, 2000)}</pre>}
    </div>
  );
}

// Memoized: during streaming only the in-flight bubble changes identity, so the
// rest of the thread keeps rendering for free on each token.
const MessageBubble = memo(function MessageBubble({ msg }: { msg: MessageUi }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2 text-sm whitespace-pre-wrap break-words">
          {msg.content}
        </div>
      </div>
    );
  }

  const cards = msg.toolCalls ?? [];
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <Bot size={15} />
      </div>
      <div className="max-w-[85%] space-y-2 min-w-0">
        {cards.map((c, i) => (
          <ToolCard key={`${i}`} tool={c.tool} ok={c.ok} preview={c.preview} />
        ))}
        {msg.content ? (
          // Streaming keeps the cheap plain-text render; markdown parses once,
          // after the reply finishes, so partial tables never jank mid-stream.
          msg.stream ? (
            <div className="rounded-2xl rounded-tl-sm bg-muted/60 px-4 py-2 text-sm whitespace-pre-wrap break-words">
              {msg.content}
              <span className="inline-block w-2 h-4 ml-1 bg-primary/60 animate-pulse align-middle" />
            </div>
          ) : (
            <div className="rounded-2xl rounded-tl-sm bg-muted/60 px-4 py-2 text-sm">
              <div className="prose prose-sm dark:prose-invert prose-p:my-1.5 prose-pre:bg-muted prose-pre:my-2 prose-table:text-sm prose-a:text-primary break-words">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              </div>
              {msg.stream && <span className="inline-block w-2 h-4 ml-1 bg-primary/60 animate-pulse align-middle" />}
            </div>
          )
        ) : msg.stream ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 size={14} className="animate-spin" /> Thinking…
          </div>
        ) : null}
      </div>
    </div>
  );
});
