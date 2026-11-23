import api from "./axios";


/* =========================================================
   TYPES
========================================================= */

export interface Staff {

  id: number;

  user_id?: number | null;

  employee_id: string;

  department?: string | null;

  designation?: string | null;

  joining_date?: string | null;

  salary?: number | null;

  emergency_contact_name?: string | null;

  emergency_contact_phone?: string | null;

  status:
    | "active"
    | "inactive";

  created_at: string;

  updated_at?: string;

  first_name?: string | null;

  last_name?: string | null;

  email?: string | null;

  mobile?: string | null;

  phone?: string | null;

  profile_image?: string | null;

}


export interface StaffAttendance {

  id: number;

  staff_id: number;

  attendance_date: string;

  check_in?: string | null;

  check_out?: string | null;

  status:
    | "present"
    | "absent"
    | "late"
    | "half_day"
    | "leave";

  remarks?: string | null;

  employee_id?: string;

  department?: string | null;

  designation?: string | null;

  first_name?: string | null;

  last_name?: string | null;

}


/* =========================================================
   GET STAFF
========================================================= */

export async function getStaff(
  params?: Record<string, unknown>
) {

  const response =
    await api.get(
      "/staff",
      {
        params
      }
    );

  return response.data;

}


/* =========================================================
   GET ONE STAFF MEMBER
========================================================= */

export async function getStaffById(
  id: number
) {

  const response =
    await api.get(
      `/staff/${id}`
    );

  return response.data;

}


/* =========================================================
   CREATE STAFF
========================================================= */

export async function createStaff(
  data: {
    userId?: number | null;

    employeeId: string;

    department?: string | null;

    designation?: string | null;

    joiningDate?: string | null;

    salary?: number | null;

    emergencyContactName?:
      string | null;

    emergencyContactPhone?:
      string | null;
  }
) {

  const response =
    await api.post(
      "/staff",
      data
    );

  return response.data;

}


/* =========================================================
   UPDATE STAFF
========================================================= */

export async function updateStaff(
  id: number,
  data: Record<string, unknown>
) {

  const response =
    await api.put(
      `/staff/${id}`,
      data
    );

  return response.data;

}


/* =========================================================
   REMOVE / DEACTIVATE STAFF
========================================================= */

export async function removeStaff(
  id: number
) {

  const response =
    await api.delete(
      `/staff/${id}`
    );

  return response.data;

}


/* =========================================================
   GET ATTENDANCE
========================================================= */

export async function getAttendance(
  params?: {
    date?: string;

    staffId?: number;
  }
) {

  const response =
    await api.get(
      "/staff/attendance",
      {
        params
      }
    );

  return response.data;

}


/* =========================================================
   SAVE / UPDATE ATTENDANCE
========================================================= */

export async function upsertAttendance(
  data: {
    staffId: number;

    attendanceDate: string;

    checkIn?: string | null;

    checkOut?: string | null;

    status:
      | "present"
      | "absent"
      | "late"
      | "half_day"
      | "leave";

    remarks?: string | null;
  }
) {

  const response =
    await api.post(
      "/staff/attendance",
      data
    );

  return response.data;

}


/* =========================================================
   ACTIVATE STAFF
========================================================= */

export async function activateStaff(
  id: number
) {

  const response =
    await api.patch(
      `/staff/${id}/status`,
      {
        status:
          "active"
      }
    );

  return response.data;

}


/* =========================================================
   DEACTIVATE STAFF
========================================================= */

export async function deactivateStaff(
  id: number
) {

  const response =
    await api.patch(
      `/staff/${id}/status`,
      {
        status:
          "inactive"
      }
    );

  return response.data;

}