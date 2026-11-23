import { useEffect, useState } from "react";
import { Store, Plus, X, ShieldCheck, Trash2, ClipboardList } from "lucide-react";

import { getVendors, createVendor, updateVendor, deleteVendor, getAllServiceRequests, updateServiceRequestStatus } from "../../api/vendors.api";
import { PageHeader, SectionCard, Button, Badge, EmptyState, Skeleton, inputStyle } from "../../components/ui/ui-kit";

export default function AdminVendors() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"vendors" | "requests">("vendors");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", phone: "", email: "", description: "", verified: false });

  async function load() {
    setLoading(true);
    try {
      const [v, r] = await Promise.all([getVendors({ all: true }), getAllServiceRequests()]);
      setVendors(v?.data || []);
      setRequests(r?.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createVendor(form);
      setForm({ name: "", category: "", phone: "", email: "", description: "", verified: false });
      setShowForm(false);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not add vendor");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(v: any) {
    await updateVendor(v.id, { status: v.status === "active" ? "inactive" : "active" });
    await load();
  }

  async function toggleVerified(v: any) {
    await updateVendor(v.id, { verified: v.verified ? 0 : 1 });
    await load();
  }

  async function remove(id: number) {
    if (!confirm("Remove this vendor?")) return;
    await deleteVendor(id);
    await load();
  }

  async function updateRequest(id: number, status: string) {
    await updateServiceRequestStatus(id, status);
    await load();
  }

  return (
    <div className="as-feature-page">
      <PageHeader
        icon={<Store size={22} />}
        title="Vendor Marketplace"
        subtitle="Manage verified local vendors and track resident service requests."
        action={<Button onClick={() => setShowForm(true)}><Plus size={16} style={{ verticalAlign: -3, marginRight: 6 }} />Add Vendor</Button>}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {(["vendors", "requests"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 16px", borderRadius: 999, border: "1px solid var(--as-border)", background: tab === t ? "var(--as-primary)" : "var(--as-surface)", color: tab === t ? "#fff" : "var(--as-text)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            {t === "vendors" ? `Vendors (${vendors.length})` : `Requests (${requests.length})`}
          </button>
        ))}
      </div>

      {loading ? <Skeleton height={200} /> : tab === "vendors" ? (
        vendors.length === 0 ? (
          <SectionCard><EmptyState icon={<Store size={40} />} title="No vendors yet" subtitle="Add your first verified vendor to populate the resident marketplace." /></SectionCard>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
            {vendors.map(v => (
              <SectionCard key={v.id}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 800, color: "var(--as-text)" }}>{v.name}</div>
                  <button onClick={() => remove(v.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--as-text-soft)" }}><Trash2 size={16} /></button>
                </div>
                <Badge tone="neutral">{v.category}</Badge>
                <p style={{ fontSize: 12.5, color: "var(--as-text-soft)", margin: "10px 0" }}>{v.phone} {v.email ? `• ${v.email}` : ""}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button onClick={() => toggleVerified(v)} variant={v.verified ? "primary" : "secondary"} style={{ height: 32, fontSize: 11.5, flex: 1 }}>
                    <ShieldCheck size={12} style={{ verticalAlign: -2, marginRight: 4 }} />{v.verified ? "Verified" : "Verify"}
                  </Button>
                  <Button onClick={() => toggleStatus(v)} variant="secondary" style={{ height: 32, fontSize: 11.5, flex: 1 }}>{v.status === "active" ? "Deactivate" : "Activate"}</Button>
                </div>
              </SectionCard>
            ))}
          </div>
        )
      ) : requests.length === 0 ? (
        <SectionCard><EmptyState icon={<ClipboardList size={40} />} title="No requests yet" /></SectionCard>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {requests.map(r => (
            <SectionCard key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, color: "var(--as-text)" }}>{r.vendor_name} — {r.first_name} {r.last_name} {r.flat_number ? `(${r.flat_number})` : ""}</div>
                <div style={{ fontSize: 12.5, color: "var(--as-text-soft)" }}>{r.description}</div>
              </div>
              <select value={r.status} onChange={e => updateRequest(r.id, e.target.value)} style={{ ...inputStyle, width: "auto", height: 34, fontSize: 12 }}>
                <option value="requested">Requested</option>
                <option value="accepted">Accepted</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </SectionCard>
          ))}
        </div>
      )}

      {showForm && (
        <div onClick={() => setShowForm(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "grid", placeItems: "center", zIndex: 1000, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} className="as-fade-in" style={{ width: "min(420px, 100%)", background: "var(--as-surface)", borderRadius: 20, padding: 24, position: "relative" }}>
            <button onClick={() => setShowForm(false)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--as-text-soft)" }}><X size={20} /></button>
            <h3 style={{ marginTop: 0, color: "var(--as-text)" }}>Add Vendor</h3>
            <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
              <input required placeholder="Vendor / business name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              <input required placeholder="Category (e.g. plumber, electrician, tutor)" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle} />
              <input required placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
              <input placeholder="Email (optional)" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} style={{ ...inputStyle, height: "auto", padding: 10 }} />
              <label style={{ fontSize: 13, color: "var(--as-text-soft)", display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={form.verified} onChange={e => setForm({ ...form, verified: e.target.checked })} /> Mark as verified
              </label>
              <Button type="submit" disabled={saving} fullWidth>{saving ? "Saving…" : "Add Vendor"}</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
