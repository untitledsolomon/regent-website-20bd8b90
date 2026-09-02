"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Agent = {
  id: string;
  name: string;
  scopes: string[];
  created_at: string;
  last_used_at?: string | null;
  revoked: boolean;
  revoked_at?: string | null;
};

const ALL_SCOPES = [
  "content:read",
  "content:write",
  "careers:read",
  "careers:write",
  "leads:read",
  "leads:write",
  "analytics:read",
  "email:send",
];

export default function Page() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newScopes, setNewScopes] = useState<string[]>(["content:read"]);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  async function fetchAgents() {
    setLoading(true);
    const res = await fetch("/api/mcp/agents");
    const data = await res.json();
    setAgents(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchAgents();
  }, []);

  async function doCreateAgent() {
    const res = await fetch("/api/mcp/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, scopes: newScopes }),
    });
    if (!res.ok) {
      alert("Failed to create agent");
      return;
    }
    const payload = await res.json();
    setCreatedKey(payload.raw_key);
    setShowCreate(false);
    setNewName("");
    setNewScopes(["content:read"]);
    fetchAgents();
  }

  async function doRevoke(id: string) {
    if (!confirm("Revoke this agent? This cannot be undone.")) return;
    const res = await fetch("/api/mcp/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      alert("Failed to revoke agent");
      return;
    }
    fetchAgents();
  }

  async function saveScopes(id: string, scopes: string[]) {
    const res = await fetch("/api/mcp/edit-scopes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, scopes }),
    });
    if (!res.ok) {
      alert("Failed to update scopes");
      return;
    }
    fetchAgents();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">MCP Agents</h1>
        <div>
          <Button onClick={() => setShowCreate(true)}>Create agent</Button>
        </div>
      </div>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left">
              <th>Name</th>
              <th>Scopes</th>
              <th>Created</th>
              <th>Last used</th>
              <th>Revoked</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="py-2">{a.name}</td>
                <td>{a.scopes.join(", ")}</td>
                <td>{new Date(a.created_at).toLocaleString()}</td>
                <td>{a.last_used_at ? new Date(a.last_used_at).toLocaleString() : "—"}</td>
                <td>{a.revoked ? "Yes" : "No"}</td>
                <td>
                  <Button onClick={() => doRevoke(a.id)} className="mr-2">Revoke</Button>
                  <EditScopesButton currentScopes={a.scopes} onSave={(scopes) => saveScopes(a.id, scopes)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showCreate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-lg font-semibold">Create agent</h2>
            <div className="mt-4">
              <label className="block">Name</label>
              <Input value={newName} onChange={(e: any) => setNewName(e.target.value)} />
            </div>
            <div className="mt-4">
              <label className="block">Scopes</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {ALL_SCOPES.map((s) => (
                  <label key={s} className="inline-flex items-center space-x-2">
                    <input type="checkbox" checked={newScopes.includes(s)} onChange={(e) => {
                      const next = new Set(newScopes);
                      if (e.target.checked) next.add(s); else next.delete(s);
                      setNewScopes(Array.from(next));
                    }} />
                    <span className="text-sm">{s}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button onClick={() => setShowCreate(false)} variant="secondary">Cancel</Button>
              <Button onClick={doCreateAgent}>Create</Button>
            </div>
          </div>
        </div>
      )}

      {createdKey && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-lg font-semibold">API key (save this now)</h2>
            <p className="text-sm text-muted">This key will not be shown again.</p>
            <pre className="bg-gray-100 p-2 mt-4 break-words">{createdKey}</pre>
            <div className="mt-4 text-right">
              <Button onClick={() => { setCreatedKey(null); }}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditScopesButton({ currentScopes, onSave }: { currentScopes: string[]; onSave: (scopes: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [scopes, setScopes] = useState<string[]>(currentScopes);

  useEffect(() => setScopes(currentScopes), [currentScopes]);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit scopes</Button>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="font-semibold">Edit scopes</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {ALL_SCOPES.map((s) => (
                <label key={s} className="inline-flex items-center space-x-2">
                  <input type="checkbox" checked={scopes.includes(s)} onChange={(e) => {
                    const next = new Set(scopes);
                    if (e.target.checked) next.add(s); else next.delete(s);
                    setScopes(Array.from(next));
                  }} />
                  <span className="text-sm">{s}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 text-right">
              <Button onClick={() => setOpen(false)} variant="secondary">Cancel</Button>
              <Button onClick={() => { onSave(scopes); setOpen(false); }}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
