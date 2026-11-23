import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { RefreshCw, Search, Plus, AlertCircle } from "lucide-react";

export interface ResourceColumn<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
}

interface AdminResourcePageProps<T extends { id: number }> {
  eyebrow: string;
  title: string;
  description: string;
  columns: ResourceColumn<T>[];
  load: (search: string) => Promise<T[]>;
  emptyLabel: string;
  addLabel?: string;
}

export default function AdminResourcePage<T extends { id: number }>({
  eyebrow,
  title,
  description,
  columns,
  load,
  emptyLabel,
  addLabel = "Add"
}: AdminResourcePageProps<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      setLoading(true);
      setError("");
      setRows(await load(search));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to load data";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // The page explicitly refreshes on first mount; filter changes are submitted manually.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: "clamp(18px, 3vw, 32px)", background: "var(--as-bg)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: "#2563eb", textTransform: "uppercase" }}>{eyebrow}</div>
            <h1 style={{ margin: "6px 0", fontSize: 30, color: "var(--as-text)" }}>{title}</h1>
            <p style={{ margin: 0, color: "var(--as-text-soft)" }}>{description}</p>
          </div>
          <button type="button" onClick={() => void refresh()} style={{ height: 42, padding: "0 14px", border: "1px solid #e2e8f0", borderRadius: 10, background: "white", display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

          <div style={{ background: "var(--as-surface)", border: "1px solid var(--as-border)", borderRadius: "var(--as-radius)", padding: 14, marginBottom: 16, boxShadow: "var(--as-shadow-sm)" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <form onSubmit={(event) => { event.preventDefault(); void refresh(); }} style={{ flex: "1 1 320px", display: "flex", gap: 10 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <Search size={17} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${title.toLowerCase()}...`} style={{ width: "100%", height: 42, border: "1px solid #e2e8f0", borderRadius: 9, padding: "0 12px 0 38px", boxSizing: "border-box" }} />
              </div>
              <button type="submit" style={{ border: 0, borderRadius: 9, background: "#0f172a", color: "white", padding: "0 16px", cursor: "pointer" }}>Search</button>
            </form>
            <button type="button" style={{ height: 42, border: 0, borderRadius: 9, background: "#2563eb", color: "white", padding: "0 15px", display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
              <Plus size={16} /> {addLabel}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: 13, borderRadius: 10, background: "#fef2f2", color: "#b91c1c", display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div style={{ background: "var(--as-surface)", border: "1px solid var(--as-border)", borderRadius: "var(--as-radius-lg)", overflow: "auto", boxShadow: "var(--as-shadow-sm)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {columns.map((column) => <th key={column.key} style={{ textAlign: "left", padding: "13px 16px", fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>{column.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length} style={{ padding: 50, textAlign: "center", color: "#64748b" }}>Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={columns.length} style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>{emptyLabel}</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  {columns.map((column) => <td key={column.key} style={{ padding: "14px 16px", fontSize: 13, color: "#334155" }}>{column.render(row)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
