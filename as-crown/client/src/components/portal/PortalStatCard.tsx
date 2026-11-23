export default function PortalStatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) {
  return <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18 }}><div style={{ color: "#64748b", fontSize: 12 }}>{title}</div><strong style={{ display: "block", marginTop: 6, color: "#0f172a", fontSize: 27 }}>{value}</strong>{subtitle && <div style={{ marginTop: 4, color: "#94a3b8", fontSize: 11 }}>{subtitle}</div>}</div>;
}
