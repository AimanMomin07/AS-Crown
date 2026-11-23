import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Lock, ShieldCheck, Slash } from "lucide-react";
import {
  getPermissions,
  updatePermission,
  type PermissionRow
} from "../../api/permissions.api";

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

export default function AdminPermissions() {
  const [rows, setRows] = useState<PermissionRow[]>([]);
  const [role, setRole] = useState("resident");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getPermissions();
      const permissions = response?.data?.permissions || [];
      setRows(permissions);
      if (!permissions.some((row: PermissionRow) => row.role_name === role)) {
        const firstRole = permissions[0]?.role_name;
        if (firstRole) setRole(firstRole);
      }
    } catch (requestError: unknown) {
      console.error("Permission load error:", requestError);
      setError(getErrorMessage(requestError, "Unable to load permissions."));
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    void load();
  }, [load]);

  const roles = useMemo(
    () => Array.from(new Set(rows.map((row) => row.role_name))),
    [rows]
  );

  const current = rows.filter((row) => row.role_name === role);

  async function toggle(permission: PermissionRow) {
    if (role === "admin") return;

    try {
      setSaving(permission.id);
      await updatePermission({
        role,
        permissionId: permission.id,
        allowed: !Number(permission.allowed)
      });
      setRows((currentRows) =>
        currentRows.map((row) =>
          row.role_name === role && row.id === permission.id
            ? { ...row, allowed: Number(!Number(permission.allowed)) }
            : row
        )
      );
    } catch (requestError: unknown) {
      console.error("Permission update error:", requestError);
      setError(getErrorMessage(requestError, "Unable to update permission."));
    } finally {
      setSaving(null);
    }
  }

  return (
    <div style={page}>
      <div style={container}>
        <div style={header}>
          <div>
            <div style={eyebrow}>ACCESS CONTROL</div>
            <h1 style={title}>Role Permissions</h1>
            <p style={subtitle}>Control exactly what each AS CROWN role can access.</p>
          </div>
        </div>

        {error ? <div style={errorBox}>{error}</div> : null}

        <div style={topBar}>
          <label style={label}>
            Role
            <select value={role} onChange={(event) => setRole(event.target.value)} style={select}>
              {roles.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          {role === "admin" ? (
            <div style={adminNotice}>
              <Lock size={16} />
              Admin has full platform access.
            </div>
          ) : null}
        </div>

        <section style={card}>
          {loading ? (
            <div style={empty}>Loading permissions...</div>
          ) : current.length === 0 ? (
            <div style={empty}>No permissions configured for this role.</div>
          ) : (
            current.map((permission) => {
              const allowed = Boolean(Number(permission.allowed));
              return (
                <div key={`${permission.role_id}-${permission.id}`} style={row}>
                  <div style={icon}><ShieldCheck size={17} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong>{permission.name}</strong>
                    <div style={muted}>{permission.description || "Society permission"}</div>
                  </div>
                  <button
                    type="button"
                    disabled={saving === permission.id || role === "admin"}
                    onClick={() => void toggle(permission)}
                    style={{
                      ...toggleButton,
                      background: allowed ? "#ecfdf5" : "#f8fafc",
                      color: allowed ? "#047857" : "#64748b",
                      opacity: saving === permission.id ? 0.65 : 1
                    }}
                  >
                    {allowed ? <Check size={14} /> : <Slash size={14} />}
                    {allowed ? "Allowed" : "Denied"}
                  </button>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", background: "#f8fafc", padding: 28 };
const container: React.CSSProperties = { maxWidth: 1050, margin: "0 auto" };
const header: React.CSSProperties = { marginBottom: 18 };
const eyebrow: React.CSSProperties = { fontSize: 10, fontWeight: 800, letterSpacing: 1.4, color: "#2563eb" };
const title: React.CSSProperties = { margin: "5px 0", fontSize: 30 };
const subtitle: React.CSSProperties = { margin: 0, color: "#64748b" };
const topBar: React.CSSProperties = { display: "flex", alignItems: "flex-end", gap: 15, flexWrap: "wrap", marginBottom: 12 };
const label: React.CSSProperties = { display: "grid", gap: 5, fontSize: 11, fontWeight: 700, color: "#64748b" };
const select: React.CSSProperties = { height: 40, minWidth: 190, border: "1px solid #e2e8f0", borderRadius: 9, padding: "0 10px", background: "white" };
const adminNotice: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 12px", borderRadius: 9, background: "#eff6ff", color: "#1d4ed8", fontSize: 11, fontWeight: 700 };
const card: React.CSSProperties = { background: "white", border: "1px solid #e2e8f0", borderRadius: 15, overflow: "hidden" };
const row: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, padding: 14, borderBottom: "1px solid #f1f5f9" };
const icon: React.CSSProperties = { width: 38, height: 38, borderRadius: 9, background: "#eff6ff", color: "#2563eb", display: "grid", placeItems: "center", flexShrink: 0 };
const muted: React.CSSProperties = { fontSize: 10, color: "#94a3b8", marginTop: 3 };
const toggleButton: React.CSSProperties = { height: 34, padding: "0 10px", border: 0, borderRadius: 8, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer" };
const empty: React.CSSProperties = { minHeight: 250, display: "grid", placeItems: "center", color: "#94a3b8" };
const errorBox: React.CSSProperties = { background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: 11, borderRadius: 10, marginBottom: 12 };
