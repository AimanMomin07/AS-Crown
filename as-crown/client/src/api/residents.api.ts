import api from "./axios";

/* =========================================================
   ADMIN → RESIDENT
========================================================= */

export async function assignResidentFlat(userId: number, flatId: number) {
  const response = await api.put(
    `/admin/residents/${userId}/flat`,
    { flatId }
  );
  return response.data;
}

export async function removeResidentFromFlat(userId: number) {
  const response = await api.delete(
    `/admin/residents/${userId}/flat`
  );
  return response.data;
}

export async function removeResident(userId: number) {
  const response = await api.delete(
    `/admin/residents/${userId}`
  );
  return response.data;
}

/* =========================================================
   DASHBOARD
========================================================= */

export async function getResidentDashboard() {
  const response = await api.get(
    "/resident/dashboard"
  );
  return response.data;
}

/* =========================================================
   HOME
========================================================= */

export async function getResidentHome() {
  const response = await api.get(
    "/resident/home"
  );
  return response.data;
}

/* =========================================================
   BILLS
========================================================= */

export async function getResidentBills(
  params?: Record<string, unknown>
) {
  const response = await api.get(
    "/resident/bills",
    { params }
  );
  return response.data;
}

export async function getResidentBill(id: number) {
  const response = await api.get(
    `/resident/bills/${id}`
  );
  return response.data;
}

/* =========================================================
   PAYMENTS
========================================================= */

export async function getResidentPayments(
  params?: Record<string, unknown>
) {
  const response = await api.get(
    "/resident/payments",
    { params }
  );
  return response.data;
}

export async function payResidentBill(
  data: {
    billId: number;
    amount: number;
    paymentMethod:
      | "upi"
      | "card"
      | "net_banking"
      | "bank_transfer"
      | "cash"
      | "other";
    transactionId?: string;
    notes?: string;
  }
) {
  const response = await api.post(
    "/resident/payments",
    data
  );
  return response.data;
}

/* =========================================================
   VISITORS
========================================================= */

export async function getResidentVisitors(
  params?: Record<string, unknown>
) {
  const response = await api.get(
    "/resident/visitors",
    { params }
  );
  return response.data;
}

export async function createResidentVisitor(
  data: {
    visitorName: string;
    phone?: string | null;
    purpose?: string | null;
    vehicleNumber?: string | null;
    visitorType:
      | "guest"
      | "delivery"
      | "service"
      | "cab"
      | "other";
    parkingAccess?: number;
    parkingSlot?: string | null;
    expectedAt?: string | null;
    notes?: string | null;
  }
) {
  const response = await api.post(
    "/resident/visitors",
    data
  );
  return response.data;
}

export async function updateResidentVisitorStatus(
  id: number,
  status:
    | "expected"
    | "inside"
    | "completed"
    | "rejected"
) {
  const response = await api.patch(
    `/resident/visitors/${id}/status`,
    { status }
  );
  return response.data;
}

/* =========================================================
   COMPLAINTS
========================================================= */

export async function getResidentComplaints(
  params?: Record<string, unknown>
) {
  const response = await api.get(
    "/resident/complaints",
    { params }
  );
  return response.data;
}

export async function getResidentComplaint(id: number) {
  const response = await api.get(
    `/resident/complaints/${id}`
  );
  return response.data;
}

export async function createResidentComplaint(
  data: {
    title: string;
    description: string;
    category:
      | "maintenance"
      | "electricity"
      | "water"
      | "security"
      | "cleaning"
      | "parking"
      | "noise"
      | "staff"
      | "other";
    priority:
      | "low"
      | "medium"
      | "high"
      | "urgent";
  }
) {
  const response = await api.post(
    "/resident/complaints",
    data
  );
  return response.data;
}

export async function acknowledgeResidentComplaint(id: number) {
  const response = await api.patch(
    `/resident/complaints/${id}/acknowledge`
  );
  return response.data;
}

/* =========================================================
   VEHICLES
========================================================= */

export async function getResidentVehicles() {
  const response = await api.get(
    "/resident/vehicles"
  );
  return response.data;
}

export async function createResidentVehicle(
  data: {
    vehicleNumber: string;
    vehicleType:
      | "car"
      | "bike"
      | "scooter"
      | "bicycle"
      | "other";
    brand?: string | null;
    model?: string | null;
    color?: string | null;
    parkingSlot?: string | null;
  }
) {
  const response = await api.post(
    "/resident/vehicles",
    data
  );
  return response.data;
}

export async function removeResidentVehicle(id: number) {
  const response = await api.delete(
    `/resident/vehicles/${id}`
  );
  return response.data;
}

/* =========================================================
   FAMILY
========================================================= */

export async function getResidentFamily() {
  const response = await api.get(
    "/resident/family"
  );
  return response.data;
}

export async function createResidentFamilyMember(
  data: {
    name: string;
    relationship: string;
    dateOfBirth?: string | null;
    gender?: "male" | "female" | "other" | null;
    phone?: string | null;
    emergencyContact?: number;
  }
) {
  const response = await api.post(
    "/resident/family",
    data
  );
  return response.data;
}

export async function removeResidentFamilyMember(id: number) {
  const response = await api.delete(
    `/resident/family/${id}`
  );
  return response.data;
}

/* =========================================================
   ANNOUNCEMENTS
========================================================= */

export async function getResidentAnnouncements() {
  const response = await api.get(
    "/resident/announcements"
  );
  return response.data;
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

export async function getResidentNotifications() {
  const response = await api.get(
    "/resident/notifications"
  );
  return response.data;
}

export async function markResidentNotificationRead(id: number) {
  const response = await api.patch(
    `/resident/notifications/${id}/read`
  );
  return response.data;
}

/* =========================================================
   PROFILE
========================================================= */

export interface ResidentProfile {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string | null;
  mobile: string | null;
  phone: string | null;
  profileImage: string | null;
  status: string;
  role: string;
  createdAt: string;
  ownershipType: string | null;
  leaseStartDate: string | null;
  leaseEndDate: string | null;
}

export async function getResidentProfile() {
  const response = await api.get(
    "/profile/me"
  );
  return response.data;
}

export async function updateResidentProfile(
  data: {
    firstName: string;
    lastName?: string;
    mobile?: string;
  }
) {
  const response = await api.put(
    "/profile/me",
    data
  );
  return response.data;
}

export async function uploadResidentProfilePhoto(file: File) {
  const formData = new FormData();
  formData.append(
    "profileImage",
    file
  );

  const response = await api.post(
    "/profile/me/photo",
    formData
  );

  return response.data;
}

export async function changeResidentPassword(
  data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
) {
  const response = await api.put(
    "/profile/me/password",
    data
  );
  return response.data;
}
