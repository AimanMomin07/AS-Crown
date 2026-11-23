import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  History,
  RefreshCw,
  Search,
  ShieldAlert,
  Users
} from "lucide-react";
import {
  getAuditLogStats,
  getAuditLogs,
  type AuditLog
} from "../../api/audit-logs.api";

interface Stats {
  total: number;
  activeUsers: number;
  actionTypes: number;
  entityTypes: number;
  last24Hours: number;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response;
    if (typeof response === "object" && response !== null && "data" in response) {
      const data = response.data;
      if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") {
        return data.message;
      }
    }
  }
  return fallback;
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    activeUsers: 0,
    actionTypes: 0,
    entityTypes: 0,
    last24Hours: 0
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setRefreshing(true);
      const [logResponse, statsResponse] = await Promise.all([
        getAuditLogs({ page, limit: 30, search: search.trim() || undefined }),
        getAuditLogStats()
      ]);

      setLogs(logResponse?.data?.logs || []);
      setTotalPages(logResponse?.data?.pagination?.totalPages || 1);
      setStats(statsResponse?.data?.stats || {
        total: 0,
        activeUsers: 0,
        actionTypes: 0,
        entityTypes: 0,
        last24Hours: 0
      });
    } catch (requestError: unknown) {
      console.error("Audit log load error:", requestError);
      setError(
        getErrorMessage(
          requestError,
          "Unable to load audit logs. Check your audit-log permission."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div style={pageStyle}>
      <div style={container}>
        <div style={header}>
          <div>
            <div style={eyebrow}>SECURITY & COMPLIANCE</div>
            <h1 style={title}>Audit Logs</h1>
            <p style={subtitle}>
              Track administrative and security activity across AS CROWN.
            </p>
          </div>

          <button type="button" onClick={() => void load()} style={refreshButton}>
            <RefreshCw size={16} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div style={errorBox}>
            {error}
          </div>
        )}

        <div style={statsGrid}>
          <Stat icon={<History size={18} />} label="Total events" value={stats.total} />
          <Stat icon={<Users size={18} />} label="Active actors" value={stats.activeUsers} />
          <Stat icon={<Activity size={18} />} label="Action types" value={stats.actionTypes} />
          <Stat icon={<ShieldAlert size={18} />} label="Last 24 hours" value={stats.last24Hours} />
        </div>

        <div style={toolbar}>
          <Search size={17} color="#94a3b8" />
          <input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search user, action, entity or details..."
            style={searchInput}
          />
        </div>

        <section style={card}>
          {loading ? (
            <div style={empty}>Loading audit activity...</div>
          ) : logs.length === 0 ? (
            <div style={empty}>
              <History size={30} />
              No audit activity found.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} style={row}>
                <div style={dot} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={actionLine}>
                    <strong>{log.action}</strong>
                    <span style={entityBadge}>{log.entity_type}</span>
                    {log.entity_id ? <span style={muted}>#{log.entity_id}</span> : null}
                  </div>
                  <div style={muted}>
                    {log.user_name || "System"}
                    {log.email ? ` • ${log.email}` : ""}
                  </div>
                  {log.details ? (
                    <div style={details}>
                      {formatDetails(log.details)}
                    </div>
                  ) : null}
                  <div style={small}>
                    {new Date(log.created_at).toLocaleString("en-IN")}
                    {log.ip_address ? ` • ${log.ip_address}` : ""}
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        {totalPages > 1 ? (
          <div style={pagination}>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              style={pagerButton}
            >
              Previous
            </button>
            <span style={muted}>Page {page} of {totalPages}</span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              style={pagerButton}
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div style={statCard}>
      <div style={statIcon}>{icon}</div>
      <div>
        <div style={small}>{label}</div>
        <strong style={statValue}>{value.toLocaleString("en-IN")}</strong>
      </div>
    </div>
  );
}

function formatDetails(value: string) {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

const errorBox: React.CSSProperties = {
  marginBottom: 12,
  padding: 12,
  borderRadius: 10,
  background: "#fef2f2",
  color: "#b91c1c",
  border: "1px solid #fecaca"
};

const pageStyle: React.CSSProperties = { minHeight: "100vh", background: "#f8fafc", padding: 28 };
const container: React.CSSProperties = { maxWidth: 1250, margin: "0 auto" };
const header: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 15, flexWrap: "wrap", marginBottom: 18 };
const eyebrow: React.CSSProperties = { fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: "#2563eb" };
const title: React.CSSProperties = { margin: "5px 0", fontSize: 30, color: "#0f172a" };
const subtitle: React.CSSProperties = { margin: 0, color: "#64748b" };
const refreshButton: React.CSSProperties = { height: 40, border: "1px solid #e2e8f0", borderRadius: 9, background: "white", padding: "0 12px", display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer", fontWeight: 700 };
const statsGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10, marginBottom: 12 };
const statCard: React.CSSProperties = { background: "white", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 10 };
const statIcon: React.CSSProperties = { width: 36, height: 36, borderRadius: 9, background: "#eff6ff", color: "#2563eb", display: "grid", placeItems: "center" };
const statValue: React.CSSProperties = { display: "block", marginTop: 3, fontSize: 20 };
const toolbar: React.CSSProperties = { background: "white", border: "1px solid #e2e8f0", borderRadius: 14, padding: 11, display: "flex", alignItems: "center", gap: 8, marginBottom: 12 };
const searchInput: React.CSSProperties = { border: 0, outline: "none", width: "100%", fontSize: 13 };
const card: React.CSSProperties = { background: "white", border: "1px solid #e2e8f0", borderRadius: 15, overflow: "hidden" };
const row: React.CSSProperties = { display: "flex", gap: 12, padding: 15, borderBottom: "1px solid #f1f5f9" };
const dot: React.CSSProperties = { width: 8, height: 8, borderRadius: "50%", background: "#2563eb", marginTop: 6, flexShrink: 0 };
const actionLine: React.CSSProperties = { display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" };
const entityBadge: React.CSSProperties = { borderRadius: 999, padding: "3px 7px", background: "#f1f5f9", color: "#475569", fontSize: 9, fontWeight: 800, textTransform: "uppercase" };
const muted: React.CSSProperties = { fontSize: 11, color: "#64748b", marginTop: 3 };
const small: React.CSSProperties = { fontSize: 10, color: "#94a3b8", marginTop: 5 };
const details: React.CSSProperties = { marginTop: 7, padding: 9, background: "#f8fafc", borderRadius: 8, fontSize: 10, color: "#475569", whiteSpace: "pre-wrap", overflowX: "auto" };
const empty: React.CSSProperties = { minHeight: 250, display: "grid", placeItems: "center", gap: 8, color: "#94a3b8" };
const pagination: React.CSSProperties = { marginTop: 12, display: "flex", justifyContent: "center", alignItems: "center", gap: 10 };
const pagerButton: React.CSSProperties = { border: "1px solid #e2e8f0", background: "white", borderRadius: 8, padding: "8px 10px", cursor: "pointer" };
