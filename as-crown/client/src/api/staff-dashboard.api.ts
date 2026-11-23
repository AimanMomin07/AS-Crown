import api from "./axios";


export interface StaffDashboardData {

  profile: {

    id: number;

    employeeId: string;

    firstName: string | null;

    lastName: string | null;

    email: string | null;

    mobile: string | null;

    profileImage: string | null;

    department: string | null;

    designation: string | null;

    joiningDate: string | null;

    status: string;

  };


  attendance: {

    id: number;

    date: string;

    status: string;

    checkIn: string | null;

    checkOut: string | null;

    notes: string | null;

  } | null;


  stats: {

    total: number;

    urgent: number;

    inProgress: number;

    resolved: number;

    breached: number;

  };


  complaints: {

    id: number;

    complaintNumber: string;

    title: string;

    description: string;

    category: string;

    priority: string;

    status: string;

    slaDueAt: string | null;

    createdAt: string;

    updatedAt: string;

  }[];

}


export async function getStaffDashboard() {

  const response =
    await api.get(
      "/staff-dashboard"
    );

  return response.data;

}
