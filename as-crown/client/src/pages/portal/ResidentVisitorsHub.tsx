import { useState } from "react";
import { Users, QrCode } from "lucide-react";

import ResidentVisitors from "../../components/resident/ResidentVisitors";
import ResidentVisitorPreApproval from "./ResidentVisitorPreApproval";

/* =========================================================
   VISITORS HUB
   Combines the existing visitor log/history with the new
   QR/OTP pre-approval feature under a single "Visitors"
   sidebar entry, as two tabs of one page.
========================================================= */

export default function ResidentVisitorsHub() {
  const [tab, setTab] = useState<"log" | "preapprove">("log");

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <button
          onClick={() => setTab("log")}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "1px solid var(--as-border)",
            background: tab === "log" ? "var(--as-primary, #2563eb)" : "var(--as-surface)",
            color: tab === "log" ? "#fff" : "var(--as-text)",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <Users size={14} /> Visitor Log
        </button>
        <button
          onClick={() => setTab("preapprove")}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "1px solid var(--as-border)",
            background: tab === "preapprove" ? "var(--as-primary, #2563eb)" : "var(--as-surface)",
            color: tab === "preapprove" ? "#fff" : "var(--as-text)",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <QrCode size={14} /> Pre-Approve (QR/OTP)
        </button>
      </div>

      {tab === "log" ? <ResidentVisitors /> : <ResidentVisitorPreApproval />}
    </div>
  );
}
