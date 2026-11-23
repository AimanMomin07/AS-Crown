import api from "./axios";
export async function getPortalDashboard() { return (await api.get("/portal/dashboard")).data; }
export async function getResidentBills() { return (await api.get("/portal/resident/bills")).data; }
export async function getResidentComplaints() { return (await api.get("/portal/resident/complaints")).data; }
export async function createResidentComplaint(data: Record<string, unknown>) { return (await api.post("/portal/resident/complaints", data)).data; }
export async function getResidentVehicles() { return (await api.get("/portal/resident/vehicles")).data; }
export async function createResidentVehicle(data: Record<string, unknown>) { return (await api.post("/portal/resident/vehicles", data)).data; }
export async function getResidentNotifications() { return (await api.get("/portal/resident/notifications")).data; }
