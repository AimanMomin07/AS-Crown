import { useEffect, useRef, useState } from "react";
import { Siren, MapPin, CheckCircle2, XCircle, Clock3 } from "lucide-react";

import { getSosAlerts, acknowledgeSos, resolveSos } from "../../api/sos.api";
import { PageHeader, SectionCard, Button, Badge, EmptyState, Skeleton } from "../../components/ui/ui-kit";

interface SosAlert {
  id: number;
  alert_type: string;
  first_name?: string;
  last_name?: string;
  flat_number?: string | null;
  building_name?: string | null;
  message?: string | null;
  created_at: string;
  mobile?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
}

export default function AdminSOSAlerts() {
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"active" | "all">("active");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function load() {
    try {
      const res = await getSosAlerts(filter === "active" ? "active" : undefined);
      setAlerts(res?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    void load();
    pollRef.current = setInterval(load, 15000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function ack(id: number) {
    await acknowledgeSos(id);
    await load();
  }

  async function resolve(id: number, falseAlarm = false) {
    await resolveSos(id, { falseAlarm });
    await load();
  }

  const typeEmoji: Record<string, string> = { medical: "🚑", fire: "🔥", security: "🛡️", other: "⚠️" };
  const statusTone: Record<string, "danger" | "warning" | "success" | "neutral"> = { active: "danger", acknowledged: "warning", resolved: "success", false_alarm: "neutral" };

  return (
    <div className="as-feature-page">
      <PageHeader icon={<Siren size={22} />} title="SOS Alerts" subtitle="Live emergency alerts from residents. Auto-refreshes every 15 seconds." />

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {(["active", "all"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 16px", borderRadius: 999, border: "1px solid var(--as-border)", background: filter === f ? "#dc2626" : "var(--as-surface)", color: filter === f ? "#fff" : "var(--as-text)", fontWeight: 700, fontSize: 13, cursor: "pointer", textTransform: "capitalize" }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton height={200} />
      ) : alerts.length === 0 ? (
        <SectionCard><EmptyState icon={<Siren size={40} />} title={filter === "active" ? "No active alerts" : "No alerts yet"} subtitle="You'll see this update live the moment someone triggers an SOS." /></SectionCard>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {alerts.map(a => (
            <SectionCard key={a.id} style={{ borderLeft: a.status === "active" ? "4px solid #dc2626" : "4px solid var(--as-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, color: "var(--as-text)", fontSize: 15 }}>
                    {typeEmoji[a.alert_type] || "⚠️"} {a.first_name} {a.last_name} {a.flat_number ? `(${a.building_name ? a.building_name + ", " : ""}${a.flat_number})` : ""}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--as-text-soft)", marginTop: 4 }}>
                    {a.message || "No additional message"}
                  </div>
                  <div style={{ display: "flex", gap: 14, fontSize: 11.5, color: "var(--as-text-soft)", marginTop: 6, flexWrap: "wrap" }}>
                    <span><Clock3 size={11} style={{ verticalAlign: -2 }} /> {new Date(a.created_at).toLocaleString()}</span>
                    {a.mobile && <span>📞 {a.mobile}</span>}
                    {a.latitude && a.longitude && (
                      <a href={`https://maps.google.com/?q=${a.latitude},${a.longitude}`} target="_blank" rel="noreferrer" style={{ color: "var(--as-primary, #2563eb)", display: "flex", alignItems: "center", gap: 3 }}>
                        <MapPin size={11} /> View location
                      </a>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <Badge tone={statusTone[a.status]}>{a.status.replace("_", " ")}</Badge>
                  {(a.status === "active" || a.status === "acknowledged") && (
                    <div style={{ display: "flex", gap: 6 }}>
                      {a.status === "active" && <Button onClick={() => ack(a.id)} variant="secondary" style={{ height: 30, fontSize: 11.5 }}>Acknowledge</Button>}
                      <Button onClick={() => resolve(a.id)} style={{ height: 30, fontSize: 11.5 }}><CheckCircle2 size={12} style={{ verticalAlign: -2, marginRight: 3 }} />Resolve</Button>
                      <Button onClick={() => resolve(a.id, true)} variant="ghost" style={{ height: 30, fontSize: 11.5 }}><XCircle size={12} style={{ verticalAlign: -2, marginRight: 3 }} />False alarm</Button>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
}
