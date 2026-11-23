import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock3, LogIn, LogOut, Phone, RefreshCw, ShieldAlert, Users, XCircle } from "lucide-react";
import { getSecurityPortal, markSecurityAttendance, updateSecurityVisitorStatus } from "../../api/security-portal.api";

interface SecurityAttendance {
  check_in?: string | null;
  check_out?: string | null;
  shift_type?: string | null;
  shift_start_at?: string | null;
  actual_end_at?: string | null;
  expected_end_at?: string | null;
}

interface SecurityVisitor {
  id: number;
  visitor_name: string;
  resident_name?: string | null;
  flat_number?: string | null;
  building_name?: string | null;
  purpose?: string | null;
  phone?: string | null;
  vehicle_number?: string | null;
  status: string;
}

interface AttendanceHistory {
  id: number;
  attendance_date: string;
  shift_type?: string | null;
  check_in?: string | null;
  check_out?: string | null;
  actual_hours?: number | string | null;
  status?: string | null;
}

interface SecurityPortalData {
  attendance?: SecurityAttendance | null;
  stats?: {
    expected?: number;
    inside?: number;
    completedToday?: number;
  };
  visitors?: SecurityVisitor[];
  attendanceHistory?: AttendanceHistory[];
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

export default function SecurityDashboard() {
  const [data, setData] = useState<SecurityPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const response = await getSecurityPortal();
      setData(response?.data || null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unable to load Security Command Center."));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);
    const timer = window.setInterval(() => void load(), 15000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(timer);
    };
  }, [load]);

  const attendance = data?.attendance;
  const workedHours = useMemo(() => {
    if (!attendance?.shift_start_at) return 0;
    const start = new Date(attendance.shift_start_at);
    const end = attendance.actual_end_at ? new Date(attendance.actual_end_at) : new Date();
    return Math.max(0, (end.getTime()-start.getTime())/3600000);
  }, [attendance]);

  async function attendanceAction(action: "check_in"|"check_out") {
    try {
      setBusy(action); setError(""); setSuccess("");
      const result = await markSecurityAttendance(action);
      setSuccess(result?.message || "Attendance updated.");
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unable to update security attendance."));
    } finally { setBusy(""); }
  }

  async function visitorAction(id:number,status:"inside"|"completed"|"rejected") {
    try {
      setBusy(`visitor-${id}`); setError(""); setSuccess("");
      const result = await updateSecurityVisitorStatus(id,status);
      setSuccess(result?.message || "Visitor status updated.");
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unable to update visitor status."));
    } finally { setBusy(""); }
  }

  if (loading) return <div style={page}><div style={empty}>Loading Security Command Center...</div></div>;
  if (!data) return <div style={page}><div style={errorBox}>{error || "Security dashboard unavailable."}</div></div>;

  const checkedIn = Boolean(attendance?.check_in && !attendance?.check_out);
  const shiftLabel = attendance?.shift_type === "night" ? "Night shift" : attendance?.shift_type === "day" ? "Day shift" : "Not started";
  const targetEnd = attendance?.expected_end_at ? new Date(attendance.expected_end_at) : null;

  return <div style={page}>
    <div style={container}>
      <header style={header}>
        <div><div style={eyebrow}>SECURITY COMMAND CENTER</div><h1 style={title}>Gate & Visitor Operations</h1><p style={sub}>Visitor approvals, entry/exit control and your 12-hour shift.</p></div>
        <button style={secondaryButton} onClick={() => void load()}><RefreshCw size={15}/> Refresh</button>
      </header>

      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:4}}>
        <Link to="/security/gate-scan" style={{...secondaryButton, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:6}}>QR/OTP Gate Scan</Link>
        <Link to="/security/sos-alerts" style={{...secondaryButton, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:6}}><ShieldAlert size={15}/> SOS Alerts</Link>
      </div>

      {error && <div style={errorBox}><ShieldAlert size={16}/> {error}</div>}
      {success && <div style={successBox}><CheckCircle2 size={16}/> {success}</div>}

      <div style={metrics}>
        <Metric icon={<Clock3 size={18}/>} label="Expected" value={Number(data.stats?.expected || 0)}/>
        <Metric icon={<Users size={18}/>} label="Inside" value={Number(data.stats?.inside || 0)}/>
        <Metric icon={<CheckCircle2 size={18}/>} label="Completed Today" value={Number(data.stats?.completedToday || 0)}/>
        <Metric icon={<ShieldAlert size={18}/>} label="Shift" value={shiftLabel}/>
      </div>

      <section style={attendancePanel}>
        <div style={panelHead}><div><div style={sectionLabel}>MY ATTENDANCE</div><h2 style={panelTitle}>12-Hour Security Shift</h2></div><ShieldAlert size={22}/></div>
        <div style={attendanceGrid}>
          <Info label="Shift" value={shiftLabel}/>
          <Info label="Check in" value={attendance?.check_in || "—"}/>
          <Info label="Expected end" value={targetEnd ? targetEnd.toLocaleString("en-IN") : "—"}/>
          <Info label="Hours worked" value={`${workedHours.toFixed(2)} / 12 hrs`}/>
        </div>
        <div style={actionRow}>
          <button disabled={checkedIn || !!busy || Boolean(attendance?.check_out)} onClick={() => void attendanceAction("check_in")} style={primaryButton}><LogIn size={16}/>{busy === "check_in" ? "Checking in..." : "Check In"}</button>
          <button disabled={!checkedIn || !!busy} onClick={() => void attendanceAction("check_out")} style={darkButton}><LogOut size={16}/>{busy === "check_out" ? "Checking out..." : "Check Out"}</button>
          <span style={hint}>Day: 06:00–17:59 · Night: 18:00–05:59 · target = 12 hours.</span>
        </div>
      </section>

      <section style={panel}>
        <div style={panelHead}><div><div style={sectionLabel}>VISITOR CONTROL</div><h2 style={panelTitle}>Approved / Expected Visitors</h2></div><span style={count}>{(data.visitors||[]).length}</span></div>
        {(data.visitors||[]).length === 0 ? <div style={emptySmall}>No expected or inside visitors right now.</div> : <div style={list}>{data.visitors?.map((v)=><article key={v.id} style={visitorCard}>
          <div style={visitorTop}><div><strong>{v.visitor_name}</strong><div style={muted}>{v.resident_name || "Resident"} · {v.flat_number || "Flat"} · {v.building_name || ""}</div></div><span style={badge(v.status)}>{v.status}</span></div>
          <div style={meta}>Purpose: {v.purpose || "—"} · Phone: {v.phone || "—"}{v.vehicle_number ? ` · Vehicle: ${v.vehicle_number}` : ""}</div>
          <div style={actionRow}>
            {v.phone && <a href={`tel:${v.phone}`} style={secondaryButton}><Phone size={14}/> Call Visitor</a>}
            {v.status === "expected" && <button disabled={!!busy} onClick={() => void visitorAction(v.id,"inside")} style={primaryButton}>{busy===`visitor-${v.id}`?"Saving...":"Allow Entry"}</button>}
            {v.status === "expected" && <button disabled={!!busy} onClick={() => void visitorAction(v.id,"rejected")} style={rejectButton}><XCircle size={14}/> Reject</button>}
            {v.status === "inside" && <button disabled={!!busy} onClick={() => void visitorAction(v.id,"completed")} style={darkButton}><LogOut size={14}/> Mark Exit</button>}
          </div>
        </article>)}</div>}
      </section>

      <section style={panel}><div style={panelHead}><h2 style={panelTitle}>Security Shift History</h2></div><div style={history}>{(data.attendanceHistory||[]).map((a,i)=><div key={`${a.id}-${i}`} style={historyRow}><span>{String(a.attendance_date).slice(0,10)}</span><span>{a.shift_type || "—"} · {a.check_in || "—"} → {a.check_out || "—"}</span><b>{a.actual_hours ? `${Number(a.actual_hours).toFixed(2)} hrs` : a.status}</b></div>)}</div></section>
    </div>
  </div>;
}
function Metric({icon,label,value}:{icon:ReactNode;label:string;value:number|string}){return <div style={metric}><div style={metricIcon}>{icon}</div><div><small style={metricLabel}>{label}</small><strong style={metricValue}>{value}</strong></div></div>}
function Info({label,value}:{label:string;value:string}){return <div><div style={labelStyle}>{label}</div><strong>{value}</strong></div>}
function badge(status:string):React.CSSProperties{return{padding:"5px 8px",borderRadius:999,background:status==="inside"?"#ecfdf5":"#eff6ff",color:status==="inside"?"#047857":"#1d4ed8",fontSize:9,fontWeight:800,textTransform:"uppercase"}}
const page:React.CSSProperties={minHeight:"100vh",background:"#f8fafc",padding:28};
const container:React.CSSProperties={maxWidth:1250,margin:"0 auto"};
const header:React.CSSProperties={display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:12,flexWrap:"wrap",marginBottom:16};
const eyebrow:React.CSSProperties={fontSize:10,fontWeight:900,letterSpacing:1.5,color:"#dc2626"};
const title:React.CSSProperties={margin:"5px 0",fontSize:30,color:"#0f172a"};
const sub:React.CSSProperties={margin:0,color:"#64748b"};
const metrics:React.CSSProperties={display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:10,marginBottom:14};
const metric:React.CSSProperties={background:"white",border:"1px solid #e2e8f0",borderRadius:14,padding:13,display:"flex",gap:9,alignItems:"center"};
const metricIcon:React.CSSProperties={width:38,height:38,borderRadius:10,display:"grid",placeItems:"center",background:"#fff7ed",color:"#ea580c"};
const metricLabel:React.CSSProperties={color:"#64748b",fontSize:9};
const metricValue:React.CSSProperties={display:"block",fontSize:20,marginTop:2};
const panel:React.CSSProperties={background:"white",border:"1px solid #e2e8f0",borderRadius:16,padding:18,marginBottom:14};
const attendancePanel=panel;
const panelHead:React.CSSProperties={display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:14};
const sectionLabel:React.CSSProperties={fontSize:10,fontWeight:900,letterSpacing:1.2,color:"#dc2626"};
const panelTitle:React.CSSProperties={margin:"4px 0 0",fontSize:18};
const attendanceGrid:React.CSSProperties={display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:12};
const actionRow:React.CSSProperties={display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginTop:14};
const primaryButton:React.CSSProperties={border:0,background:"#dc2626",color:"white",borderRadius:9,padding:"9px 12px",display:"inline-flex",alignItems:"center",gap:7,cursor:"pointer",fontWeight:800,textDecoration:"none"};
const darkButton:React.CSSProperties={border:0,background:"#0f172a",color:"white",borderRadius:9,padding:"9px 12px",display:"inline-flex",alignItems:"center",gap:7,cursor:"pointer",fontWeight:800,textDecoration:"none"};
const secondaryButton:React.CSSProperties={border:"1px solid #e2e8f0",background:"white",color:"#334155",borderRadius:9,padding:"9px 12px",display:"inline-flex",alignItems:"center",gap:7,cursor:"pointer",fontWeight:700,textDecoration:"none"};
const rejectButton:React.CSSProperties={border:"1px solid #fecaca",background:"#fef2f2",color:"#b91c1c",borderRadius:9,padding:"9px 12px",display:"inline-flex",alignItems:"center",gap:7,cursor:"pointer",fontWeight:700};
const hint:React.CSSProperties={fontSize:10,color:"#94a3b8"};
const errorBox:React.CSSProperties={padding:11,borderRadius:10,background:"#fef2f2",color:"#b91c1c",marginBottom:12,display:"flex",gap:7};
const successBox:React.CSSProperties={padding:11,borderRadius:10,background:"#ecfdf5",color:"#047857",marginBottom:12,display:"flex",gap:7};
const visitorCard:React.CSSProperties={border:"1px solid #e2e8f0",borderRadius:13,padding:14};
const visitorTop:React.CSSProperties={display:"flex",justifyContent:"space-between",gap:10};
const muted:React.CSSProperties={fontSize:10,color:"#64748b",marginTop:4};
const meta:React.CSSProperties={fontSize:10,color:"#94a3b8",marginTop:8};
const count:React.CSSProperties={padding:"5px 9px",borderRadius:999,background:"#fee2e2",color:"#b91c1c",fontWeight:800,fontSize:10};
const list:React.CSSProperties={display:"grid",gap:10};
const history:React.CSSProperties={display:"grid",gap:7};
const historyRow:React.CSSProperties={display:"grid",gridTemplateColumns:"1fr 2fr auto",gap:8,padding:"9px 0",borderBottom:"1px solid #f1f5f9",fontSize:11};
const labelStyle:React.CSSProperties={fontSize:9,color:"#94a3b8",marginBottom:2};
const empty:React.CSSProperties={minHeight:300,display:"grid",placeItems:"center",color:"#94a3b8"};
const emptySmall:React.CSSProperties={padding:30,textAlign:"center",color:"#94a3b8",fontSize:12};
