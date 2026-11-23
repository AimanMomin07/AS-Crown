import { useEffect, useState } from "react";
import { BrainCircuit, IndianRupee, AlertTriangle, TrendingDown } from "lucide-react";

import { getDuesIntelligence } from "../../api/dues-intelligence.api";
import { PageHeader, SectionCard, StatCard, Badge, EmptyState, Skeleton } from "../../components/ui/ui-kit";

interface FlatRisk {
  flatId: number;
  flatNumber: string;
  buildingName?: string;
  residentName: string;
  residentPhone?: string;
  outstanding: number;
  overdueCount: number;
  maxDaysOverdue: number;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
}

interface DuesSummary {
  totalOutstanding: number;
  highRiskFlats: number;
  highRiskOutstanding: number;
  mediumRiskFlats: number;
  projectedNextMonthDefault: number;
}

export default function AdminDuesIntelligence() {
  const [summary, setSummary] = useState<DuesSummary | null>(null);
  const [flats, setFlats] = useState<FlatRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");

  useEffect(() => {
    (async () => {
      try {
        const res = await getDuesIntelligence();
        setSummary(res?.data?.summary || null);
        setFlats(res?.data?.flats || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = filter === "all" ? flats : flats.filter(f => f.riskLevel === filter);

  const riskTone: Record<string, "success" | "warning" | "danger"> = { low: "success", medium: "warning", high: "danger" };

  return (
    <div className="as-feature-page">
      <PageHeader icon={<BrainCircuit size={22} />} title="Dues Intelligence" subtitle="Predictive risk scoring so you can chase the right residents before they default." />

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} height={110} />)}
        </div>
      ) : summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
          <StatCard icon={<IndianRupee size={16} />} label="Total Outstanding" value={`₹${summary.totalOutstanding.toLocaleString("en-IN")}`} tone="primary" />
          <StatCard icon={<AlertTriangle size={16} />} label="High Risk Flats" value={summary.highRiskFlats} tone="danger" hint={`₹${summary.highRiskOutstanding.toLocaleString("en-IN")} at risk`} />
          <StatCard icon={<TrendingDown size={16} />} label="Medium Risk Flats" value={summary.mediumRiskFlats} tone="warning" />
          <StatCard icon={<BrainCircuit size={16} />} label="Projected Next-Month Default" value={`₹${summary.projectedNextMonthDefault.toLocaleString("en-IN")}`} tone="primary" hint="Model estimate, not a guarantee" />
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["all", "high", "medium", "low"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 16px", borderRadius: 999, border: "1px solid var(--as-border)", background: filter === f ? "var(--as-primary)" : "var(--as-surface)", color: filter === f ? "#fff" : "var(--as-text)", fontWeight: 700, fontSize: 13, cursor: "pointer", textTransform: "capitalize" }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton height={300} />
      ) : filtered.length === 0 ? (
        <SectionCard><EmptyState icon={<BrainCircuit size={40} />} title="No flats in this risk band" /></SectionCard>
      ) : (
        <SectionCard style={{ padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid var(--as-border)" }}>
                {["Flat", "Resident", "Outstanding", "Overdue Bills", "Days Overdue", "Risk"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", color: "var(--as-text-soft)", fontWeight: 700, fontSize: 11.5, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.flatId} style={{ borderBottom: "1px solid var(--as-border)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--as-text)" }}>{f.flatNumber}{f.buildingName ? `, ${f.buildingName}` : ""}</td>
                  <td style={{ padding: "12px 16px", color: "var(--as-text)" }}>{f.residentName}{f.residentPhone ? <div style={{ fontSize: 11, color: "var(--as-text-soft)" }}>{f.residentPhone}</div> : null}</td>
                  <td style={{ padding: "12px 16px", color: "var(--as-text)" }}>₹{f.outstanding.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "12px 16px", color: "var(--as-text)" }}>{f.overdueCount}</td>
                  <td style={{ padding: "12px 16px", color: "var(--as-text)" }}>{f.maxDaysOverdue}</td>
                  <td style={{ padding: "12px 16px" }}><Badge tone={riskTone[f.riskLevel]}>{f.riskLevel} · {f.riskScore}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      )}
    </div>
  );
}
