import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarCheck2, CheckCircle2, Clock3, FileWarning, LogIn, LogOut, RefreshCw, ShieldAlert, UserCheck } from "lucide-react";
import { getStaffPortal, markStaffAttendance, updateStaffWorkStatus } from "../../api/staff-portal.api";

interface StaffAttendanceRecord {
  status?: string | null;
  check_in?: string | null;
  check_out?: string | null;
  attendance_date?: string | null;
}

interface StaffWorkItem {
  id: number;
  complaint_number?: string | null;
  title?: string | null;
  description?: string | null;
  status: string;
  priority?: string | null;
  category?: string | null;
  sla_due_at?: string | null;
}

interface StaffAnnouncement {
  id: number;
  title: string;
  content: string;
}

interface StaffPortalData {
  attendance?: StaffAttendanceRecord | null;
  attendanceHistory?: StaffAttendanceRecord[];
  announcements?: StaffAnnouncement[];
  work?: StaffWorkItem[];
  profile?: { firstName?: string; lastName?: string };
  stats?: Record<string, number | null | undefined>;
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

export default function StaffDashboard() {
  const [data, setData] = useState<StaffPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getStaffPortal();
      setData(response?.data || null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unable to load staff workspace."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [load]);

  const attendance = data?.attendance;
  const canCheckIn = !attendance?.check_in;
  const canCheckOut = Boolean(attendance?.check_in) && !attendance?.check_out;

  const hoursWorked = useMemo(() => {
    if (!attendance?.check_in) return 0;
    const start = new Date(`1970-01-01T${attendance.check_in}`);
    const end = attendance.check_out
      ? new Date(`1970-01-01T${attendance.check_out}`)
      : new Date(`1970-01-01T${new Date().toTimeString().slice(0,8)}`);
    if (end < start) end.setDate(end.getDate() + 1);
    return Math.max(0, (end.getTime() - start.getTime()) / 3600000);
  }, [attendance]);

  async function attendanceAction(action: "check_in" | "check_out") {
    try {
      setBusy(action);
      setError("");
      setSuccess("");
      const result = await markStaffAttendance(action);
      setSuccess(result?.message || "Attendance updated.");
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unable to update attendance."));
    } finally {
      setBusy("");
    }
  }

  async function workAction(id: number, status: "in_progress" | "resolved") {
    try {
      setBusy(`work-${id}`);
      setError("");
      const result = await updateStaffWorkStatus(id, status);
      setSuccess(result?.message || "Work updated.");
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unable to update work."));
    } finally {
      setBusy("");
    }
  }

  if (loading) return <div style={page}><div style={empty}>Loading Staff Workspace...</div></div>;

  if (!data) return <div style={page}><div style={errorBox}>{error || "Staff workspace unavailable."}</div></div>;

  const name = `${data.profile?.firstName || ""} ${data.profile?.lastName || ""}`.trim() || "Staff Member";

  return <div style={page}>
    <div style={container}>
      <header style={header}>
        <div><div style={eyebrow}>STAFF WORKSPACE</div><h1 style={title}>{name}</h1><p style={sub}>Attendance, assigned work and society duties.</p></div>
        <button style={secondaryButton} onClick={() => void load()}><RefreshCw size={15}/> Refresh</button>
      </header>

      {error && <div style={errorBox}><AlertTriangle size={16}/> {error}</div>}
      {success && <div style={successBox}><CheckCircle2 size={16}/> {success}</div>}

      <section style={attendancePanel}>
        <div style={panelHead}><div><div style={sectionLabel}>MY ATTENDANCE</div><h2 style={panelTitle}>Today's Shift</h2></div><CalendarCheck2 size={22}/></div>
        <div style={attendanceGrid}>
          <Info label="Status" value={attendance?.status || "Not marked"}/>
          <Info label="Check in" value={attendance?.check_in || "—"}/>
          <Info label="Check out" value={attendance?.check_out || "—"}/>
          <Info label="Hours worked" value={`${hoursWorked.toFixed(2)} hrs`}/>
        </div>
        <div style={actionRow}>
          <button disabled={!canCheckIn || !!busy} onClick={() => void attendanceAction("check_in")} style={primaryButton}><LogIn size={16}/>{busy === "check_in" ? "Checking in..." : "Check In"}</button>
          <button disabled={!canCheckOut || !!busy} onClick={() => void attendanceAction("check_out")} style={darkButton}><LogOut size={16}/>{busy === "check_out" ? "Checking out..." : "Check Out"}</button>
          <span style={hint}>Your attendance is recorded against your staff account.</span>
        </div>
      </section>

      <div style={metrics}>
        <Metric icon={<FileWarning size={18}/>} label="Assigned" value={Number(data.stats?.assigned || 0)}/>
        <Metric icon={<ShieldAlert size={18}/>} label="Urgent" value={Number(data.stats?.urgent_count || 0)}/>
        <Metric icon={<Clock3 size={18}/>} label="In Progress" value={Number(data.stats?.in_progress_count || 0)}/>
        <Metric icon={<CheckCircle2 size={18}/>} label="Resolved" value={Number(data.stats?.resolved_count || 0)}/>
        <Metric icon={<AlertTriangle size={18}/>} label="SLA Breached" value={Number(data.stats?.breached_count || 0)}/>
      </div>

      <section style={panel}>
        <div style={panelHead}><div><div style={sectionLabel}>MY WORK</div><h2 style={panelTitle}>Assigned Complaints</h2></div><UserCheck size={21}/></div>
        {(data.work || []).length === 0 ? <div style={emptySmall}>No active work assigned to you.</div> : <div style={list}>{data.work?.map((item) => <article key={item.id} style={workCard}>
          <div style={workTop}><div><strong style={number}>{item.complaint_number}</strong><h3 style={workTitle}>{item.title}</h3></div><span style={badge(item.status)}>{item.status}</span></div>
          <p style={workDesc}>{item.description}</p>
          <div style={meta}>Priority: {item.priority} · Category: {item.category}{item.sla_due_at ? ` · SLA: ${new Date(item.sla_due_at).toLocaleString("en-IN")}` : ""}</div>
          <div style={actionRow}>
            {item.status !== "in_progress" && <button disabled={!!busy} onClick={() => void workAction(item.id, "in_progress")} style={secondaryButton}>Start Work</button>}
            <button disabled={!!busy} onClick={() => void workAction(item.id, "resolved")} style={primaryButton}>{busy === `work-${item.id}` ? "Saving..." : "Mark Resolved"}</button>
          </div>
        </article>)}</div>}
      </section>

      <section style={twoCol}>
        <section style={panel}><div style={panelHead}><h2 style={panelTitle}>Attendance History</h2></div><div style={history}>{(data.attendanceHistory || []).map((x, i) => <div key={`${x.attendance_date}-${i}`} style={historyRow}><span>{String(x.attendance_date).slice(0,10)}</span><span>{x.check_in || "—"} → {x.check_out || "—"}</span><b>{x.status}</b></div>)}</div></section>
        <section style={panel}><div style={panelHead}><h2 style={panelTitle}>Latest Announcements</h2></div><div style={history}>{(data.announcements || []).map((a) => <div key={a.id} style={announcement}><b>{a.title}</b><span>{a.content}</span></div>)}</div></section>
      </section>
    </div>
  </div>;
}

function Metric({icon,label,value}:{icon:React.ReactNode;label:string;value:number}) { return <div style={metric}><div style={metricIcon}>{icon}</div><div><small style={metricLabel}>{label}</small><strong style={metricValue}>{value}</strong></div></div>; }
function Info({label,value}:{label:string;value:string}) { return <div><div style={labelStyle}>{label}</div><strong>{value}</strong></div>; }
function badge(status:string): React.CSSProperties { return {padding:"5px 8px",borderRadius:999,background:status==="resolved"?"#ecfdf5":status==="in_progress"?"#fff7ed":"#eff6ff",color:status==="resolved"?"#047857":status==="in_progress"?"#c2410c":"#1d4ed8",fontSize:9,fontWeight:800,textTransform:"uppercase"}; }
const page:React.CSSProperties={minHeight:"100vh",background:"#f8fafc",padding:28};
const container:React.CSSProperties={maxWidth:1250,margin:"0 auto"};
const header:React.CSSProperties={display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:12,flexWrap:"wrap",marginBottom:16};
const eyebrow:React.CSSProperties={fontSize:10,fontWeight:900,letterSpacing:1.5,color:"#2563eb"};
const title:React.CSSProperties={margin:"5px 0",fontSize:30,color:"#0f172a"};
const sub:React.CSSProperties={margin:0,color:"#64748b"};
const attendancePanel:React.CSSProperties={background:"white",border:"1px solid #e2e8f0",borderRadius:16,padding:18,marginBottom:14};
const panel:React.CSSProperties={background:"white",border:"1px solid #e2e8f0",borderRadius:16,padding:18,marginBottom:14};
const panelHead:React.CSSProperties={display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:14};
const sectionLabel:React.CSSProperties={fontSize:10,fontWeight:900,letterSpacing:1.2,color:"#2563eb"};
const panelTitle:React.CSSProperties={margin:"4px 0 0",fontSize:18};
const attendanceGrid:React.CSSProperties={display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:12};
const metrics:React.CSSProperties={display:"grid",gridTemplateColumns:"repeat(5,minmax(0,1fr))",gap:10,marginBottom:14};
const metric:React.CSSProperties={background:"white",border:"1px solid #e2e8f0",borderRadius:14,padding:13,display:"flex",gap:9,alignItems:"center"};
const metricIcon:React.CSSProperties={width:38,height:38,borderRadius:10,display:"grid",placeItems:"center",background:"#eff6ff",color:"#2563eb"};
const metricLabel:React.CSSProperties={color:"#64748b",fontSize:9};
const metricValue:React.CSSProperties={display:"block",fontSize:22,marginTop:2};
const actionRow:React.CSSProperties={display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginTop:14};
const primaryButton:React.CSSProperties={border:0,background:"#2563eb",color:"white",borderRadius:9,padding:"9px 12px",display:"inline-flex",alignItems:"center",gap:7,cursor:"pointer",fontWeight:800};
const darkButton:React.CSSProperties={border:0,background:"#0f172a",color:"white",borderRadius:9,padding:"9px 12px",display:"inline-flex",alignItems:"center",gap:7,cursor:"pointer",fontWeight:800};
const secondaryButton:React.CSSProperties={border:"1px solid #e2e8f0",background:"white",color:"#334155",borderRadius:9,padding:"9px 12px",display:"inline-flex",alignItems:"center",gap:7,cursor:"pointer",fontWeight:700};
const hint:React.CSSProperties={fontSize:10,color:"#94a3b8"};
const errorBox:React.CSSProperties={padding:11,borderRadius:10,background:"#fef2f2",color:"#b91c1c",marginBottom:12,display:"flex",gap:7};
const successBox:React.CSSProperties={padding:11,borderRadius:10,background:"#ecfdf5",color:"#047857",marginBottom:12,display:"flex",gap:7};
const list:React.CSSProperties={display:"grid",gap:10};
const workCard:React.CSSProperties={border:"1px solid #e2e8f0",borderRadius:13,padding:14};
const workTop:React.CSSProperties={display:"flex",justifyContent:"space-between",gap:10};
const number:React.CSSProperties={fontSize:9,color:"#2563eb"};
const workTitle:React.CSSProperties={margin:"4px 0",fontSize:15};
const workDesc:React.CSSProperties={fontSize:11,color:"#64748b",lineHeight:1.5};
const meta:React.CSSProperties={fontSize:10,color:"#94a3b8"};
const twoCol:React.CSSProperties={display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:14};
const history:React.CSSProperties={display:"grid",gap:7};
const historyRow:React.CSSProperties={display:"grid",gridTemplateColumns:"1fr 1.5fr auto",gap:8,padding:"9px 0",borderBottom:"1px solid #f1f5f9",fontSize:11};
const announcement:React.CSSProperties={display:"grid",gap:3,padding:"9px 0",borderBottom:"1px solid #f1f5f9",fontSize:11};
const labelStyle:React.CSSProperties={fontSize:9,color:"#94a3b8",marginBottom:2};
const empty:React.CSSProperties={minHeight:300,display:"grid",placeItems:"center",color:"#94a3b8"};
const emptySmall:React.CSSProperties={padding:30,textAlign:"center",color:"#94a3b8",fontSize:12};
