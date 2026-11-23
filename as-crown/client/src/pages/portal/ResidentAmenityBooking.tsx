import { useEffect, useState } from "react";
import { CalendarDays, Users2, IndianRupee, X, CheckCircle2 } from "lucide-react";

import { getAmenities, getAvailableSlots, createBooking, getMyBookings, cancelBooking } from "../../api/amenities.api";
import { PageHeader, SectionCard, Button, Badge, EmptyState, Skeleton } from "../../components/ui/ui-kit";

interface Amenity {
  id: number;
  name: string;
  description?: string;
  category?: string;
  capacity: number;
  booking_fee: number;
  image_url?: string;
}

interface Slot {
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  available: number;
}

interface Booking {
  id: number;
  amenity_name?: string;
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

export default function ResidentAmenityBooking() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Amenity | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState<Slot | null>(null);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"browse" | "mine">("browse");

  async function load() {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([getAmenities(), getMyBookings()]);
      setAmenities(a?.data || []);
      setMyBookings(b?.data || []);
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

  async function openAmenity(a: Amenity) {
    setSelected(a);
    setSlotsLoading(true);
    try {
      const res = await getAvailableSlots(a.id, date);
      setSlots(res?.data?.slots || []);
    } catch (e) {
      console.error(e);
    } finally {
      setSlotsLoading(false);
    }
  }

  async function changeDate(newDate: string) {
    setDate(newDate);
    if (selected) {
      setSlotsLoading(true);
      try {
        const res = await getAvailableSlots(selected.id, newDate);
        setSlots(res?.data?.slots || []);
      } finally {
        setSlotsLoading(false);
      }
    }
  }

  async function confirmBooking(slot: Slot) {
    if (!selected) return;
    try {
      await createBooking({
        amenityId: selected.id,
        bookingDate: date,
        startTime: slot.startTime,
        endTime: slot.endTime
      });
      setBooking(null);
      setSelected(null);
      await load();
      setTab("mine");
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Could not confirm booking"));
    }
  }

  async function cancel(id: number) {
    if (!confirm("Cancel this booking?")) return;
    await cancelBooking(id);
    await load();
  }

  return (
    <div>
      <PageHeader icon={<CalendarDays size={22} />} title="Amenity Booking" subtitle="Book the clubhouse, pool, courts and more — no double-booking, ever." />

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {(["browse", "mine"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "1px solid var(--as-border)",
              background: tab === t ? "var(--as-primary)" : "var(--as-surface)",
              color: tab === t ? "#fff" : "var(--as-text)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer"
            }}
          >
            {t === "browse" ? "Browse" : `My Bookings (${myBookings.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {[1, 2, 3].map(i => <Skeleton key={i} height={140} />)}
        </div>
      ) : tab === "browse" ? (
        amenities.length === 0 ? (
          <SectionCard><EmptyState icon={<CalendarDays size={40} />} title="No amenities set up yet" subtitle="Ask an admin to add amenities in Admin → Amenities." /></SectionCard>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {amenities.map(a => (
              <SectionCard key={a.id} style={{ cursor: "pointer" }}>
                <div onClick={() => openAmenity(a)}>
                  <div style={{ fontWeight: 800, fontSize: 15.5, color: "var(--as-text)", marginBottom: 4 }}>{a.name}</div>
                  {a.category && <Badge tone="neutral">{a.category}</Badge>}
                  <p style={{ fontSize: 13, color: "var(--as-text-soft)", margin: "10px 0" }}>{a.description || "No description"}</p>
                  <div style={{ display: "flex", gap: 14, fontSize: 12.5, color: "var(--as-text-soft)" }}>
                    <span><Users2 size={13} style={{ verticalAlign: -2 }} /> {a.capacity} capacity</span>
                    <span><IndianRupee size={12} style={{ verticalAlign: -2 }} /> {Number(a.booking_fee) > 0 ? a.booking_fee : "Free"}</span>
                  </div>
                </div>
              </SectionCard>
            ))}
          </div>
        )
      ) : myBookings.length === 0 ? (
        <SectionCard><EmptyState icon={<CalendarDays size={40} />} title="No bookings yet" subtitle="Browse amenities and reserve your slot." /></SectionCard>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {myBookings.map(b => (
            <SectionCard key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, color: "var(--as-text)" }}>{b.amenity_name}</div>
                <div style={{ fontSize: 12.5, color: "var(--as-text-soft)" }}>{b.booking_date} • {b.start_time}–{b.end_time}</div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Badge tone={b.status === "confirmed" ? "success" : b.status === "cancelled" ? "danger" : "neutral"}>{b.status}</Badge>
                {b.status === "confirmed" && (
                  <button onClick={() => cancel(b.id)} style={{ background: "none", border: "1px solid var(--as-border)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12, color: "var(--as-text-soft)" }}>Cancel</button>
                )}
              </div>
            </SectionCard>
          ))}
        </div>
      )}

      {/* SLOT PICKER MODAL */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "grid", placeItems: "center", zIndex: 1000, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} className="as-fade-in" style={{ width: "min(480px, 100%)", maxHeight: "85vh", overflowY: "auto", background: "var(--as-surface)", borderRadius: 20, padding: 24, position: "relative" }}>
            <button onClick={() => setSelected(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--as-text-soft)" }}><X size={20} /></button>
            <h3 style={{ marginTop: 0, color: "var(--as-text)" }}>{selected.name}</h3>
            <input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={e => changeDate(e.target.value)} style={{ width: "100%", boxSizing: "border-box", height: 42, border: "1px solid var(--as-border)", borderRadius: 10, padding: "0 12px", marginBottom: 16, background: "var(--as-surface)", color: "var(--as-text)" }} />

            {slotsLoading ? (
              <Skeleton height={200} />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {slots.map(s => (
                  <button
                    key={s.startTime}
                    disabled={s.available === 0}
                    onClick={() => setBooking(s)}
                    style={{
                      padding: "10px 8px",
                      borderRadius: 10,
                      border: "1px solid var(--as-border)",
                      background: s.available === 0 ? "var(--as-surface-soft)" : "var(--as-surface)",
                      color: s.available === 0 ? "var(--as-text-soft)" : "var(--as-text)",
                      cursor: s.available === 0 ? "not-allowed" : "pointer",
                      fontSize: 12.5,
                      fontWeight: 700
                    }}
                  >
                    {s.startTime.slice(0, 5)}–{s.endTime.slice(0, 5)}
                    <div style={{ fontWeight: 500, fontSize: 11, marginTop: 2 }}>{s.available === 0 ? "Full" : `${s.available} left`}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      {booking && selected && (
        <div onClick={() => setBooking(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "grid", placeItems: "center", zIndex: 1100, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} className="as-fade-in" style={{ width: "min(360px, 100%)", background: "var(--as-surface)", borderRadius: 20, padding: 24, textAlign: "center" }}>
            <CheckCircle2 size={36} color="#16a34a" style={{ marginBottom: 10 }} />
            <h3 style={{ margin: "0 0 6px", color: "var(--as-text)" }}>Confirm booking</h3>
            <p style={{ color: "var(--as-text-soft)", fontSize: 13.5, marginBottom: 18 }}>
              {selected.name} • {date} • {booking.startTime.slice(0, 5)}–{booking.endTime.slice(0, 5)}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="secondary" onClick={() => setBooking(null)} fullWidth>Cancel</Button>
              <Button onClick={() => confirmBooking(booking)} fullWidth>Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
