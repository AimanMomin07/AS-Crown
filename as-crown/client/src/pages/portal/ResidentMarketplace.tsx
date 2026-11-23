import { useCallback, useEffect, useState } from "react";
import { Store, Star, ShieldCheck, Phone, X, ClipboardList } from "lucide-react";

import { getVendors, requestService, getMyServiceRequests } from "../../api/vendors.api";
import { PageHeader, SectionCard, Button, Badge, EmptyState, Skeleton, inputStyle } from "../../components/ui/ui-kit";

interface Vendor {
  id: number;
  name: string;
  category: string;
  phone: string;
  description?: string;
  rating: number;
  rating_count: number;
  verified: number;
}

interface ServiceRequest {
  id: number;
  vendor_name?: string;
  category?: string;
  description?: string;
  status?: string;
  created_at?: string;
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

export default function ResidentMarketplace() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"browse" | "requests">("browse");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [desc, setDesc] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [v, r] = await Promise.all([getVendors(category ? { category } : undefined), getMyServiceRequests()]);
      setVendors(v?.data || []);
      setRequests(r?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [load]);

  const categories = Array.from(new Set(vendors.map(v => v.category))).filter(Boolean);

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || desc.trim().length < 5) return;
    setSending(true);
    try {
      await requestService({ vendorId: selected.id, description: desc.trim() });
      setSelected(null);
      setDesc("");
      await load();
      setTab("requests");
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Could not submit request"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <PageHeader icon={<Store size={22} />} title="Local Marketplace" subtitle="Verified plumbers, electricians, cleaners and more — book them straight from the society app." />

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {(["browse", "requests"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 16px", borderRadius: 999, border: "1px solid var(--as-border)", background: tab === t ? "var(--as-primary)" : "var(--as-surface)", color: tab === t ? "#fff" : "var(--as-text)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            {t === "browse" ? "Browse Vendors" : `My Requests (${requests.length})`}
          </button>
        ))}
      </div>

      {tab === "browse" && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <button onClick={() => setCategory("")} style={{ padding: "6px 14px", borderRadius: 999, border: "1px solid var(--as-border)", background: !category ? "var(--as-primary-soft, #eff6ff)" : "var(--as-surface)", color: "var(--as-text)", fontSize: 12, cursor: "pointer" }}>All</button>
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{ padding: "6px 14px", borderRadius: 999, border: "1px solid var(--as-border)", background: category === c ? "#eff6ff" : "var(--as-surface)", color: "var(--as-text)", fontSize: 12, cursor: "pointer", textTransform: "capitalize" }}>{c}</button>
          ))}
        </div>
      )}

      {loading ? (
        <Skeleton height={200} />
      ) : tab === "browse" ? (
        vendors.length === 0 ? (
          <SectionCard><EmptyState icon={<Store size={40} />} title="No vendors listed yet" subtitle="Ask an admin to add verified vendors in Admin → Vendors." /></SectionCard>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
            {vendors.map(v => (
              <SectionCard key={v.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontWeight: 800, color: "var(--as-text)" }}>{v.name}</div>
                  {!!v.verified && <ShieldCheck size={16} color="#16a34a" />}
                </div>
                <Badge tone="neutral">{v.category}</Badge>
                <p style={{ fontSize: 12.5, color: "var(--as-text-soft)", margin: "10px 0" }}>{v.description}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12.5, color: "var(--as-text-soft)" }}>
                    <Star size={12} style={{ verticalAlign: -2, color: "#f59e0b" }} /> {Number(v.rating).toFixed(1)} ({v.rating_count})
                  </span>
                  <a href={`tel:${v.phone}`} style={{ fontSize: 12.5, color: "var(--as-primary, #2563eb)", display: "flex", alignItems: "center", gap: 4 }}><Phone size={12} />{v.phone}</a>
                </div>
                <Button onClick={() => setSelected(v)} fullWidth style={{ marginTop: 12, height: 36, fontSize: 13 }}>Request Service</Button>
              </SectionCard>
            ))}
          </div>
        )
      ) : requests.length === 0 ? (
        <SectionCard><EmptyState icon={<ClipboardList size={40} />} title="No service requests yet" /></SectionCard>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {requests.map(r => (
            <SectionCard key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, color: "var(--as-text)" }}>{r.vendor_name} <span style={{ fontWeight: 400, color: "var(--as-text-soft)", fontSize: 12 }}>({r.category})</span></div>
                <div style={{ fontSize: 12.5, color: "var(--as-text-soft)" }}>{r.description}</div>
              </div>
              <Badge tone={r.status === "completed" ? "success" : r.status === "cancelled" ? "danger" : r.status === "accepted" ? "primary" : "warning"}>{r.status}</Badge>
            </SectionCard>
          ))}
        </div>
      )}

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "grid", placeItems: "center", zIndex: 1000, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} className="as-fade-in" style={{ width: "min(400px, 100%)", background: "var(--as-surface)", borderRadius: 20, padding: 24, position: "relative" }}>
            <button onClick={() => setSelected(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--as-text-soft)" }}><X size={20} /></button>
            <h3 style={{ marginTop: 0, color: "var(--as-text)" }}>Request {selected.name}</h3>
            <form onSubmit={submitRequest} style={{ display: "grid", gap: 12 }}>
              <textarea required minLength={5} placeholder="Describe what you need (e.g. 'Leaking kitchen tap, need repair this week')" value={desc} onChange={e => setDesc(e.target.value)} rows={4} style={{ ...inputStyle, height: "auto", padding: 10 }} />
              <Button type="submit" disabled={sending} fullWidth>{sending ? "Sending…" : "Send Request"}</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
