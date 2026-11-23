import api from "./axios";
export interface Attendance{ id:number; staff_id:number; attendance_date:string; check_in:string|null; check_out:string|null; status:"present"|"absent"|"late"|"half_day"|"leave"; remarks?:string|null; employee_id?:string; department?:string|null; designation?:string|null; first_name?:string|null; last_name?:string|null; }
export async function getAttendance(params?:{date?:string;staffId?:number}){return (await api.get("/attendance",{params})).data;}
export async function saveAttendance(data:{staffId:number;attendanceDate:string;checkIn?:string|null;checkOut?:string|null;status:Attendance["status"];remarks?:string|null}){return (await api.post("/attendance",data)).data;}
