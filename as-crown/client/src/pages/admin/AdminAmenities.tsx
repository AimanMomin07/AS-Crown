import { useEffect, useState } from "react";
import { CalendarRange, Plus, X, Trash2, ListChecks } from "lucide-react";

import { getAmenities, createAmenity, updateAmenity, deleteAmenity, getAllBookings, cancelBooking } from "../../api/amenities.api";
import { PageHeader, SectionCard, Button, Badge, EmptyState, Skeleton, inputStyle } from "../../components/ui/ui-kit";

interface Amenity {
  id: number;
  name: string;
  description?: string;
  category?: string;
  capacity: number;
  open_time: string;
  close_time: string;
  slot_minutes: number;
  booking_fee: number;
  status: string;
}

interface AmenityBooking {
  id: number;
  amenity_name?: string;
  first_name?: string;
  last_name?: string;
  resident_name?: string;
  flat_number?: string;
  booking_date?: string;
  start_time?: string;
  end_time?: string;
  status?: string;
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

export default function AdminAmenities() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [bookings, setBookings] = useState<AmenityBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<"amenities" | "bookings">("amenities");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "", description: "", category: "", capacity: 10,
    openTime: "06:00:00", closeTime: "22:00:00", slotMinutes: 60, bookingFee: 0, maxAdvanceDays: 14
  });

  async function load() {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([getAmenities(true), getAllBookings()]);
      setAmenities(a?.data || []);
      setBookings(b?.data || []);
    } catch (e) {
      console.error(e);
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
    setSaving(true);
    try {
      await createAmenity(form);
      setForm({ name: "", description: "", category: "", capacity: 10, openTime: "06:00:00", closeTime: "22:00:00", slotMinutes: 60, bookingFee: 0, maxAdvanceDays: 14 });
      setShowForm(false);
      await load();
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Could not create amenity"));
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(a: Amenity) {
    await updateAmenity(a.id, { status: a.status === "active" ? "inactive" : "active" });
    await load();
  }

  async function remove(id: number) {
    if (!confirm("Deactivate this amenity?")) return;
    await deleteAmenity(id);
    await load();
  }

  async function cancelAdminBooking(id: number) {
    if (!confirm("Cancel this booking?")) return;
    await cancelBooking(id);
    await load();
  }

  return (
    <div className="as-feature-page">
      <PageHeader
        icon={<CalendarRange size={22} />}
        title="Amenities & Bookings"
        subtitle="Manage clubhouse, pool, courts and gym — and see everything residents have booked."
        action={<Button onClick={() => setShowForm(true)}><Plus size={16} style={{ verticalAlign: -3, marginRight: 6 }} />Add Amenity</Button>}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {(["amenities", "bookings"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 16px", borderRadius: 999, border: "1px solid var(--as-border)", background: tab === t ? "var(--as-primary)" : "var(--as-surface)", color: tab === t ? "#fff" : "var(--as-text)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            {t === "amenities" ? `Amenities (${amenities.length})` : `Bookings (${bookings.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton height={200} />
      ) : tab === "amenities" ? (
        amenities.length === 0 ? (
          <SectionCard><EmptyState icon={<CalendarRange size={40} />} title="No amenities yet" subtitle="Add your first amenity to let residents start booking." /></SectionCard>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
            {amenities.map(a => (
              <SectionCard key={a.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 800, color: "var(--as-text)" }}>{a.name}</div>
                    {a.category && <Badge tone="neutral">{a.category}</Badge>}
                  </div>
                  <button onClick={() => remove(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--as-text-soft)" }}><Trash2 size={16} /></button>
                </div>
                <p style={{ fontSize: 12.5, color: "var(--as-text-soft)", margin: "10px 0" }}>{a.description}</p>
                <div style={{ fontSize: 12, color: "var(--as-text-soft)", marginBottom: 10 }}>
                  {a.open_time?.slice(0,5)}–{a.close_time?.slice(0,5)} • {a.slot_minutes}min slots • cap {a.capacity} • ₹{a.booking_fee}
                </div>
                <Button variant={a.status === "active" ? "secondary" : "primary"} onClick={() => toggleStatus(a)} style={{ height: 34, fontSize: 12 }}>
                  {a.status === "active" ? "Deactivate" : "Activate"}
                </Button>
              </SectionCard>
            ))}
          </div>
        )
      ) : bookings.length === 0 ? (
        <SectionCard><EmptyState icon={<ListChecks size={40} />} title="No bookings yet" /></SectionCard>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {bookings.map(b => (
            <SectionCard key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, color: "var(--as-text)" }}>{b.amenity_name} — {b.first_name} {b.last_name} {b.flat_number ? `(${b.flat_number})` : ""}</div>
                <div style={{ fontSize: 12.5, color: "var(--as-text-soft)" }}>{b.booking_date} • {b.start_time}–{b.end_time}</div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Badge tone={b.status === "confirmed" ? "success" : b.status === "cancelled" ? "danger" : "neutral"}>{b.status}</Badge>
                {b.status === "confirmed" && <button onClick={() => cancelAdminBooking(b.id)} style={{ background: "none", border: "1px solid var(--as-border)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12, color: "var(--as-text-soft)" }}>Cancel</button>}
              </div>
            </SectionCard>
          ))}
        </div>
      )}

      {showForm && (
        <div onClick={() => setShowForm(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "grid", placeItems: "center", zIndex: 1000, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} className="as-fade-in" style={{ width: "min(460px, 100%)", maxHeight: "88vh", overflowY: "auto", background: "var(--as-surface)", borderRadius: 20, padding: 24, position: "relative" }}>
            <button onClick={() => setShowForm(false)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--as-text-soft)" }}><X size={20} /></button>
            <h3 style={{ marginTop: 0, color: "var(--as-text)" }}>Add Amenity</h3>
            <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
              <input required placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              <input placeholder="Category (e.g. sports, hall, fitness)" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle} />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} style={{ ...inputStyle, height: "auto", padding: 10 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <label style={{ fontSize: 12, color: "var(--as-text-soft)" }}>Capacity
                  <input type="number" min={1} value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} style={{ ...inputStyle, marginTop: 4 }} />
                </label>
                <label style={{ fontSize: 12, color: "var(--as-text-soft)" }}>Booking fee (₹)
                  <input type="number" min={0} value={form.bookingFee} onChange={e => setForm({ ...form, bookingFee: Number(e.target.value) })} style={{ ...inputStyle, marginTop: 4 }} />
                </label>
                <label style={{ fontSize: 12, color: "var(--as-text-soft)" }}>Open time
                  <input type="time" value={form.openTime.slice(0,5)} onChange={e => setForm({ ...form, openTime: e.target.value + ":00" })} style={{ ...inputStyle, marginTop: 4 }} />
                </label>
                <label style={{ fontSize: 12, color: "var(--as-text-soft)" }}>Close time
                  <input type="time" value={form.closeTime.slice(0,5)} onChange={e => setForm({ ...form, closeTime: e.target.value + ":00" })} style={{ ...inputStyle, marginTop: 4 }} />
                </label>
                <label style={{ fontSize: 12, color: "var(--as-text-soft)" }}>Slot length (min)
                  <input type="number" min={15} step={15} value={form.slotMinutes} onChange={e => setForm({ ...form, slotMinutes: Number(e.target.value) })} style={{ ...inputStyle, marginTop: 4 }} />
                </label>
                <label style={{ fontSize: 12, color: "var(--as-text-soft)" }}>Max advance (days)
                  <input type="number" min={1} value={form.maxAdvanceDays} onChange={e => setForm({ ...form, maxAdvanceDays: Number(e.target.value) })} style={{ ...inputStyle, marginTop: 4 }} />
                </label>
              </div>
              <Button type="submit" disabled={saving} fullWidth>{saving ? "Saving…" : "Create Amenity"}</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
