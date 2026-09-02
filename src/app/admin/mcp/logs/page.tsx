"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LogEntry = {
  id: string;
  agent_id: string;
  agent_name: string;
  tool_name: string;
  input_summary?: Record<string, any>;
  success: boolean;
  error_message?: string | null;
  created_at: string;
  duration_ms: number;
};

const TOOLS = [
  "list_content",
  "create_content",
  "update_content",
  "delete_content",
  "list_careers",
  "create_careers",
  "update_careers",
  "delete_careers",
  "list_leads",
  "create_leads",
  "update_leads",
  "send_newsletter",
  "get_analytics",
];

export default function Page() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [filterAgent, setFilterAgent] = useState("");
  const [filterTool, setFilterTool] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([]);
  const [stats, setStats] = useState({ totalToday: 0, errorRate: 0, topTools: [] as Array<{ tool: string; count: number }> });

  async function fetchLogs() {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...(filterAgent && { agent_id: filterAgent }),
      ...(filterTool && { tool_name: filterTool }),
    });
    const res = await fetch(`/api/mcp/logs?${params}`);
    const data = await res.json();
    setLogs(data.logs || []);
    setStats({
      totalToday: data.totalToday || 0,
      errorRate: data.errorRate || 0,
      topTools: data.topTools || [],
    });
    setLoading(false);
  }

  async function fetchAgents() {
    const res = await fetch("/api/mcp/agents");
    const data = await res.json();
    setAgents(data || []);
  }

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [page, filterAgent, filterTool]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">MCP Call Logs</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-100 p-4 rounded">
          <div className="text-sm text-gray-600">Calls Today</div>
          <div className="text-2xl font-semibold">{stats.totalToday}</div>
        </div>
        <div className="bg-gray-100 p-4 rounded">
          <div className="text-sm text-gray-600">Error Rate</div>
          <div className="text-2xl font-semibold">{stats.errorRate.toFixed(1)}%</div>
        </div>
        <div className="bg-gray-100 p-4 rounded">
          <div className="text-sm text-gray-600">Top Tool</div>
          <div className="text-2xl font-semibold">{stats.topTools[0]?.tool || "—"}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select value={filterAgent} onChange={(e) => { setFilterAgent(e.target.value); setPage(1); }} className="border rounded px-3 py-2">
          <option value="">All agents</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <select value={filterTool} onChange={(e) => { setFilterTool(e.target.value); setPage(1); }} className="border rounded px-3 py-2">
          <option value="">All tools</option>
          {TOOLS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div>Loading…</div>
      ) : (
        <>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left">
                <th>Timestamp</th>
                <th>Agent</th>
                <th>Tool</th>
                <th>Status</th>
                <th>Duration (ms)</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr className="border-t cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                    <td className="py-2">{new Date(log.created_at).toLocaleString()}</td>
                    <td>{log.agent_name}</td>
                    <td>{log.tool_name}</td>
                    <td>{log.success ? <span className="text-green-600">✓ Success</span> : <span className="text-red-600">✗ Failed</span>}</td>
                    <td>{log.duration_ms}</td>
                  </tr>
                  {expandedId === log.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="p-4">
                        <div className="text-sm">
                          {log.input_summary && (
                            <>
                              <strong>Input:</strong>
                              <pre className="bg-white p-2 rounded mt-1 text-xs overflow-auto">{JSON.stringify(log.input_summary, null, 2)}</pre>
                            </>
                          )}
                          {log.error_message && (
                            <>
                              <strong className="text-red-600 mt-2 block">Error:</strong>
                              <pre className="bg-white p-2 rounded mt-1 text-xs overflow-auto">{log.error_message}</pre>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="mt-4 flex justify-center gap-2">
            <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <span className="py-2 px-4">{page}</span>
            <Button onClick={() => setPage(p => p + 1)} disabled={logs.length < perPage}>Next</Button>
          </div>
        </>
      )}
    </div>
  );
}
