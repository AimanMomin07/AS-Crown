import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Leaf, Droplets, Zap, Recycle, Car, CloudRain, Sun, Plus, X } from "lucide-react";

import { getSustainabilityDashboard, recordMetric } from "../../api/sustainability.api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, SectionCard, StatCard, Button, EmptyState, Skeleton, inputStyle } from "../../components/ui/ui-kit";

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

const METRIC_META: Record<string, { label: string; icon: ReactElement; defaultUnit: string; tone: "primary" | "success" | "warning" | "danger" }> = {
  water_tank: { label: "Water Tank Level", icon: <Droplets size={16} />, defaultUnit: "%", tone: "primary" },
  electricity: { label: "Electricity Usage", icon: <Zap size={16} />, defaultUnit: "kWh", tone: "warning" },
  waste_segregation: { label: "Waste Segregation", icon: <Recycle size={16} />, defaultUnit: "%", tone: "success" },
  ev_charging: { label: "EV Charging Usage", icon: <Car size={16} />, defaultUnit: "kWh", tone: "primary" },
  rainwater_harvest: { label: "Rainwater Harvested", icon: <CloudRain size={16} />, defaultUnit: "kL", tone: "primary" },
  solar_generation: { label: "Solar Generation", icon: <Sun size={16} />, defaultUnit: "kWh", tone: "success" }
};

export default function SustainabilityDashboard() {
  const { user } = useAuth();
  const canRecord = user?.role === "admin" || user?.role === "staff";

  const [latest, setLatest] = useState<Record<string, { value: number; unit: string; recordedAt: string }>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ metricType: "water_tank", value: "", unit: "%", notes: "" });

  async function load() {
    setLoading(true);
    try {
      const res = await getSustainabilityDashboard();
      setLatest(res?.data?.latest || {});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(initialLoad);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.value) return;
    setSaving(true);
    try {
      await recordMetric({ metricType: form.metricType, value: Number(form.value), unit: form.unit, notes: form.notes || undefined });
      setForm({ metricType: "water_tank", value: "", unit: "%", notes: "" });
      setShowForm(false);
      await load();
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Could not record metric"));
    } finally {
      setSaving(false);
    }
  }

  const hasAny = Object.keys(latest).length > 0;

  return (
    <div className="as-feature-page">
      <PageHeader
        icon={<Leaf size={22} />}
        title="Sustainability Dashboard"
        subtitle="Track water, energy and waste metrics across the society."
        action={canRecord ? <Button onClick={() => setShowForm(true)}><Plus size={16} style={{ verticalAlign: -3, marginRight: 6 }} />Record Reading</Button> : undefined}
      />

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} height={110} />)}
        </div>
      ) : !hasAny ? (
        <SectionCard>
          <EmptyState icon={<Leaf size={40} />} title="No readings recorded yet" subtitle={canRecord ? "Click 'Record Reading' to add your first data point." : "Check back once admin starts logging readings."} />
        </SectionCard>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
          {Object.entries(METRIC_META).map(([key, meta]) => {
            const reading = latest[key];
            if (!reading) return null;
            return (
              <StatCard
                key={key}
                icon={meta.icon}
                label={meta.label}
                value={`${reading.value} ${reading.unit}`}
                tone={meta.tone}
                hint={`Updated ${new Date(reading.recordedAt).toLocaleDateString()}`}
              />
            );
          })}
        </div>
      )}

      {showForm && (
        <div onClick={() => setShowForm(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "grid", placeItems: "center", zIndex: 1000, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} className="as-fade-in" style={{ width: "min(400px, 100%)", background: "var(--as-surface)", borderRadius: 20, padding: 24, position: "relative" }}>
            <button onClick={() => setShowForm(false)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--as-text-soft)" }}><X size={20} /></button>
            <h3 style={{ marginTop: 0, color: "var(--as-text)" }}>Record Reading</h3>
            <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
              <select
                value={form.metricType}
                onChange={e => setForm({ ...form, metricType: e.target.value, unit: METRIC_META[e.target.value].defaultUnit })}
                style={inputStyle}
              >
                {Object.entries(METRIC_META).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}
              </select>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
                <input required type="number" step="0.01" placeholder="Value" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} style={inputStyle} />
                <input required placeholder="Unit" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={inputStyle} />
              </div>
              <input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={inputStyle} />
              <Button type="submit" disabled={saving} fullWidth>{saving ? "Saving…" : "Save Reading"}</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
