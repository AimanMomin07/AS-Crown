import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarCheck2, CheckCircle2, LogIn, LogOut, RefreshCw, UserCheck } from "lucide-react";
import { getStaffPortal, markStaffAttendance } from "../../api/staff-portal.api";

interface AttendanceRecord {
  status?: string | null;
  check_in?: string | null;
  check_out?: string | null;
  attendance_date?: string | null;
}

interface StaffAttendanceData {
  attendance?: AttendanceRecord | null;
  attendanceHistory?: AttendanceRecord[];
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

export default function StaffAttendance() {
  const [data,setData]=useState<StaffAttendanceData | null>(null);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState("");
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const load=useCallback(async()=>{try{setLoading(true);setError("");const r=await getStaffPortal();setData(r?.data||null);}catch(e:unknown){setError(getErrorMessage(e,"Unable to load attendance."));}finally{setLoading(false);}},[]);
  useEffect(()=>{const initialLoad=window.setTimeout(()=>void load(),0);return()=>window.clearTimeout(initialLoad);},[load]);
  async function act(a:"check_in"|"check_out"){try{setBusy(a);setMessage("");setError("");const r=await markStaffAttendance(a);setMessage(r?.message||"Attendance updated.");await load();}catch(e:unknown){setError(getErrorMessage(e,"Unable to update attendance."));}finally{setBusy("");}}
  const today=data?.attendance;
  const hours=useMemo(()=>{if(!today?.check_in)return 0;const s=new Date(`1970-01-01T${today.check_in}`);const e=today.check_out?new Date(`1970-01-01T${today.check_out}`):new Date(`1970-01-01T${new Date().toTimeString().slice(0,8)}`);if(e<s)e.setDate(e.getDate()+1);return Math.max(0,(e.getTime()-s.getTime())/3600000);},[today]);
  if(loading)return <div style={page}><div style={card}>Loading attendance...</div></div>;
  return <div style={page}><div style={container}><header style={header}><div><div style={eyebrow}>MY ATTENDANCE</div><h1 style={title}>Staff Attendance</h1><p style={sub}>Check in, check out and view your recent attendance.</p></div><button style={secondary} onClick={()=>void load()}><RefreshCw size={15}/> Refresh</button></header>{error&&<div style={err}>{error}</div>}{message&&<div style={ok}><CheckCircle2 size={15}/> {message}</div>}<section style={card}><div style={head}><h2>Today's Attendance</h2><CalendarCheck2 size={21}/></div><div style={grid}><Info l="Status" v={today?.status||"Not marked"}/><Info l="Check in" v={today?.check_in||"—"}/><Info l="Check out" v={today?.check_out||"—"}/><Info l="Hours" v={`${hours.toFixed(2)} hrs`}/></div><div style={actions}><button disabled={!!busy||Boolean(today?.check_in)} style={primary} onClick={()=>void act("check_in")}><LogIn size={15}/>{busy==="check_in"?"Checking in...":"Check In"}</button><button disabled={!!busy||!today?.check_in||Boolean(today?.check_out)} style={dark} onClick={()=>void act("check_out")}><LogOut size={15}/>{busy==="check_out"?"Checking out...":"Check Out"}</button></div></section><section style={card}><div style={head}><h2>Last 7 Days</h2><UserCheck size={21}/></div><div>{(data?.attendanceHistory||[]).map((x,i)=><div key={`${x.attendance_date}-${i}`} style={row}><span>{String(x.attendance_date).slice(0,10)}</span><span>{x.check_in||"—"} → {x.check_out||"—"}</span><b>{x.status}</b></div>)}</div></section></div></div>;
}
function Info({l,v}:{l:string;v:string}){return <div><div style={label}>{l}</div><strong>{v}</strong></div>}
const page:React.CSSProperties={minHeight:"100vh",background:"#f8fafc",padding:28};const container:React.CSSProperties={maxWidth:900,margin:"0 auto"};const header:React.CSSProperties={display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:10,flexWrap:"wrap",marginBottom:16};const eyebrow:React.CSSProperties={fontSize:10,fontWeight:900,letterSpacing:1.4,color:"#2563eb"};const title:React.CSSProperties={margin:"5px 0",fontSize:29};const sub:React.CSSProperties={margin:0,color:"#64748b"};const card:React.CSSProperties={background:"white",border:"1px solid #e2e8f0",borderRadius:16,padding:18,marginBottom:14};const head:React.CSSProperties={display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:15};const grid:React.CSSProperties={display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:12};const actions:React.CSSProperties={display:"flex",gap:8,marginTop:18};const primary:React.CSSProperties={border:0,background:"#2563eb",color:"white",borderRadius:9,padding:"10px 13px",display:"inline-flex",alignItems:"center",gap:7,fontWeight:800,cursor:"pointer"};const dark:React.CSSProperties={border:0,background:"#0f172a",color:"white",borderRadius:9,padding:"10px 13px",display:"inline-flex",alignItems:"center",gap:7,fontWeight:800,cursor:"pointer"};const secondary:React.CSSProperties={border:"1px solid #e2e8f0",background:"white",borderRadius:9,padding:"9px 12px",display:"inline-flex",alignItems:"center",gap:7,cursor:"pointer",fontWeight:700};const row:React.CSSProperties={display:"grid",gridTemplateColumns:"1fr 1.5fr auto",gap:8,padding:"10px 0",borderBottom:"1px solid #f1f5f9",fontSize:12};const label:React.CSSProperties={fontSize:9,color:"#94a3b8",marginBottom:2};const err:React.CSSProperties={background:"#fef2f2",color:"#b91c1c",padding:11,borderRadius:10,marginBottom:12};const ok:React.CSSProperties={background:"#ecfdf5",color:"#047857",padding:11,borderRadius:10,marginBottom:12};
