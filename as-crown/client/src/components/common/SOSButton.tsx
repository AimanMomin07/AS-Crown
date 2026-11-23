import { useState } from "react";
import { AlertTriangle, X, Siren } from "lucide-react";

import { triggerSos } from "../../api/sos.api";

const ALERT_TYPES: { key: "medical" | "fire" | "security" | "other"; label: string; emoji: string }[] = [
  { key: "medical", label: "Medical Emergency", emoji: "🚑" },
  { key: "fire", label: "Fire", emoji: "🔥" },
  { key: "security", label: "Security Threat", emoji: "🛡️" },
  { key: "other", label: "Other Emergency", emoji: "⚠️" }
];

export default function SOSButton() {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");

  async function send(alertType: "medical" | "fire" | "security" | "other") {
    setSending(true);
    try {
      let latitude: number | undefined;
      let longitude: number | undefined;

      if (navigator.geolocation) {
        await new Promise<void>(resolve => {
          navigator.geolocation.getCurrentPosition(
            pos => {
              latitude = pos.coords.latitude;
              longitude = pos.coords.longitude;
              resolve();
            },
            () => resolve(),
            { timeout: 3000 }
          );
        });
      }

      await triggerSos({ alertType, message: message || undefined, latitude, longitude });
      setSent(true);
      setTimeout(() => {
        setOpen(false);
        setSent(false);
        setMessage("");
      }, 2200);
    } catch (error) {
      console.error("SOS trigger failed:", error);
      alert("Could not send SOS alert. Please call security directly.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Emergency SOS"
        className="as-sos-button"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "#dc2626",
          color: "#fff",
          border: "none",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          zIndex: 900,
          boxShadow: "0 8px 20px rgba(220, 38, 38, 0.35)"
        }}
      >
        <Siren size={26} />
      </button>

      {open && (
        <div
          onClick={() => !sending && setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
            padding: 16
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="as-fade-in"
            style={{
              width: "min(420px, 100%)",
              background: "var(--as-surface)",
              borderRadius: 20,
              padding: 24,
              position: "relative"
            }}
          >
            <button
              onClick={() => !sending && setOpen(false)}
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--as-text-soft)" }}
            >
              <X size={20} />
            </button>

            {sent ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
                <h3 style={{ margin: 0, color: "var(--as-text)" }}>Help is on the way</h3>
                <p style={{ color: "var(--as-text-soft)", fontSize: 13.5 }}>
                  Security and admin have been alerted with your location.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <AlertTriangle color="#dc2626" size={22} />
                  <h3 style={{ margin: 0, color: "var(--as-text)" }}>Emergency SOS</h3>
                </div>
                <p style={{ color: "var(--as-text-soft)", fontSize: 13, marginBottom: 16 }}>
                  This immediately alerts security and admin with your location. Use only for genuine emergencies.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  {ALERT_TYPES.map(t => (
                    <button
                      key={t.key}
                      disabled={sending}
                      onClick={() => send(t.key)}
                      style={{
                        border: "1px solid var(--as-border)",
                        background: "var(--as-surface-soft)",
                        color: "var(--as-text)",
                        borderRadius: 12,
                        padding: "14px 10px",
                        cursor: sending ? "not-allowed" : "pointer",
                        fontWeight: 700,
                        fontSize: 13,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{t.emoji}</span>
                      {t.label}
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Optional: add a short note (e.g. 'stuck on 3rd floor')"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={2}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: "1px solid var(--as-border)",
                    borderRadius: 10,
                    padding: 10,
                    fontSize: 13,
                    resize: "none",
                    background: "var(--as-surface)",
                    color: "var(--as-text)"
                  }}
                />
                {sending && <p style={{ textAlign: "center", fontSize: 12.5, color: "var(--as-text-soft)", marginTop: 8 }}>Sending alert…</p>}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
