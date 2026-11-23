import { useEffect, useState } from "react";
import { QrCode, Plus, X, Clock, CheckCircle2, Ban } from "lucide-react";

import {
  createPreapproval,
  getMyPreapprovals,
  cancelPreapproval
} from "../../api/visitor-preapproval.api";

import { PageHeader, SectionCard, Button, Badge, EmptyState, Skeleton, inputStyle } from "../../components/ui/ui-kit";

interface Preapproval {
  id: number;
  visitor_name: string;
  visitor_phone?: string | null;
  purpose?: string | null;
  qr_token?: string | null;
  qrImage?: string | null;
  otp_code: string;
  status: "pending" | "used" | "expired" | "cancelled";
  valid_from: string;
  valid_until: string;
  used_at?: string | null;
  created_at: string;
}

export default function ResidentVisitorPreApproval() {
  const [rows, setRows] = useState<Preapproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [qrResult, setQrResult] = useState<{ qrImage: string; otp: string; visitorName: string } | null>(null);

  const [form, setForm] = useState({
    visitorName: "",
    visitorPhone: "",
    purpose: "",
    hours: 6
  });

  async function load() {
    setLoading(true);
    try {
      const res = await getMyPreapprovals();
      setRows(res?.data || []);
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
    if (!form.visitorName.trim()) return;
    setCreating(true);
    try {
      const validFrom = new Date();
      const validUntil = new Date(validFrom.getTime() + form.hours * 60 * 60 * 1000);

      const res = await createPreapproval({
        visitorName: form.visitorName,
        visitorPhone: form.visitorPhone || undefined,
        purpose: form.purpose || undefined,
        validFrom: validFrom.toISOString(),
        validUntil: validUntil.toISOString()
      });

      setQrResult({
        qrImage: res.data.qrImage,
        otp: res.data.otp,
        visitorName: form.visitorName
      });
      setForm({ visitorName: "", visitorPhone: "", purpose: "", hours: 6 });
      setShowForm(false);
      await load();
    } catch (err) {
      console.error(err);
      alert("Could not create the pass. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  function showPass(row: Preapproval) {

    if (
      !row.qrImage
    ) {

      return;

    }

    setQrResult({
      qrImage:
        row.qrImage,
      otp:
        row.otp_code,
      visitorName:
        row.visitor_name
    });

  }


  async function copyOtp(
    value: string
  ) {

    try {

      await navigator.clipboard.writeText(
        value
      );

      alert(
        "OTP copied to clipboard."
      );

    } catch {

      alert(
        `OTP: ${value}`
      );

    }

  }


  function downloadQr(
    row: Preapproval
  ) {

    if (
      !row.qrImage
    ) {

      return;

    }

    const link =
      document.createElement(
        "a"
      );

    link.href =
      row.qrImage;

    link.download =
      `AS-CROWN-${row.visitor_name.replace(/[^a-z0-9]+/gi, "-")}-visitor-qr.png`;

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

  }


  async function cancel(id: number) {
    if (!confirm("Cancel this visitor pass?")) return;
    try {
      await cancelPreapproval(id);
      await load();
    } catch (e) {
      console.error(e);
    }
  }

  const statusTone: Record<string, "success" | "warning" | "danger" | "neutral"> = {
    pending: "warning",
    used: "success",
    expired: "neutral",
    cancelled: "danger"
  };

  return (
    <div>
      <PageHeader
        icon={<QrCode size={22} />}
        title="Visitor Pre-Approval"
        subtitle="Generate a QR code or OTP so your guest can breeze through the gate."
        action={<Button onClick={() => setShowForm(true)}><Plus size={16} style={{ verticalAlign: -3, marginRight: 6 }} />New Pass</Button>}
      />

      {loading ? (
        <div style={{ display: "grid", gap: 12 }}>
          <Skeleton height={72} />
          <Skeleton height={72} />
        </div>
      ) : rows.length === 0 ? (
        <SectionCard>
          <EmptyState icon={<QrCode size={40} />} title="No visitor passes yet" subtitle="Create one before your guest arrives — no more waiting at the gate." />
        </SectionCard>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {rows.map(r => (
            <SectionCard key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700, color: "var(--as-text)", marginBottom: 4 }}>{r.visitor_name}</div>
                <div style={{ fontSize: 12.5, color: "var(--as-text-soft)", display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {r.visitor_phone && <span>{r.visitor_phone}</span>}
                  {r.purpose && <span>• {r.purpose}</span>}
                  <span><Clock size={12} style={{ verticalAlign: -2 }} /> Valid until {new Date(r.valid_until).toLocaleString()}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {r.status === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => showPass(r)}
                      title="Show QR"
                      style={{
                        border: "1px solid var(--as-border)",
                        background: "var(--as-surface)",
                        color: "var(--as-text)",
                        borderRadius: 9,
                        padding: "7px 9px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontWeight: 700,
                        fontSize: 11
                      }}
                    >
                      <QrCode size={14} />
                      QR
                    </button>

                    <button
                      type="button"
                      onClick={() => void copyOtp(r.otp_code)}
                      title="Copy OTP"
                      style={{
                        border: "1px solid var(--as-border)",
                        background: "var(--as-surface)",
                        color: "var(--as-text)",
                        borderRadius: 9,
                        padding: "7px 9px",
                        cursor: "pointer",
                        fontFamily: "monospace",
                        fontWeight: 700,
                        fontSize: 11
                      }}
                    >
                      {r.otp_code}
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadQr(r)}
                      title="Download QR"
                      style={{
                        border: "1px solid var(--as-border)",
                        background: "var(--as-surface)",
                        color: "var(--as-text)",
                        borderRadius: 9,
                        padding: "7px 9px",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: 11
                      }}
                    >
                      Download
                    </button>
                  </>
                )}

                <Badge tone={statusTone[r.status]}>
                  {r.status === "used" && <CheckCircle2 size={11} style={{ verticalAlign: -1 }} />} {r.status}
                </Badge>

                {r.status === "pending" && (
                  <button
                    onClick={() => cancel(r.id)}
                    title="Cancel"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--as-text-soft)"
                    }}
                  >
                    <Ban size={16} />
                  </button>
                )}
              </div>
            </SectionCard>
          ))}
        </div>
      )}

      {/* CREATE FORM MODAL */}
      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h3 style={{ marginTop: 0, color: "var(--as-text)" }}>New Visitor Pass</h3>
          <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
            <input required placeholder="Visitor name" value={form.visitorName} onChange={e => setForm({ ...form, visitorName: e.target.value })} style={inputStyle} />
            <input placeholder="Visitor phone (optional)" value={form.visitorPhone} onChange={e => setForm({ ...form, visitorPhone: e.target.value })} style={inputStyle} />
            <input placeholder="Purpose (e.g. friend visit, delivery)" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} style={inputStyle} />
            <label style={{ fontSize: 13, color: "var(--as-text-soft)" }}>
              Valid for
              <select value={form.hours} onChange={e => setForm({ ...form, hours: Number(e.target.value) })} style={{ ...inputStyle, marginTop: 6 }}>
                <option value={2}>2 hours</option>
                <option value={6}>6 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>24 hours</option>
              </select>
            </label>
            <Button type="submit" disabled={creating} fullWidth>{creating ? "Creating…" : "Generate Pass"}</Button>
          </form>
        </Modal>
      )}

      {/* QR RESULT MODAL */}
      {qrResult && (
        <Modal onClose={() => setQrResult(null)}>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ marginTop: 0, color: "var(--as-text)" }}>Pass ready for {qrResult.visitorName}</h3>
            <img src={qrResult.qrImage} alt="Visitor QR code" style={{ width: 220, height: 220, borderRadius: 12, border: "1px solid var(--as-border)" }} />
            <p style={{ color: "var(--as-text-soft)", fontSize: 13, margin: "12px 0 4px" }}>Share this QR with your guest, or give them the OTP:</p>
            <div style={{ fontFamily: "monospace", fontSize: 28, fontWeight: 800, letterSpacing: 4, color: "var(--as-text)" }}>{qrResult.otp}</div>
            <Button onClick={() => setQrResult(null)} style={{ marginTop: 16 }} fullWidth>Done</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "grid", placeItems: "center", zIndex: 1000, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} className="as-fade-in" style={{ width: "min(420px, 100%)", background: "var(--as-surface)", borderRadius: 20, padding: 24, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--as-text-soft)" }}>
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}
