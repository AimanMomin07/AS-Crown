import api from "./axios";

export interface AdminAnalytics {
  occupancy: {
    totalFlats: number;
    occupied: number;
    vacant: number;
    rented: number;
    maintenance: number;
    percentage: number;
  };

  finance: {
    billedThisMonth: number;
    collectedThisMonth: number;
    outstanding: number;
    overdueCount: number;
    overdueAmount: number;
  };

  complaints: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    rejected: number;
  };

  visitors: {
    total: number;
    expected: number;
    inside: number;
    completed: number;
    rejected: number;
  };

  staffAttendance: {
    total: number;
    present: number;
    absent: number;
    late: number;
    halfDay: number;
    leave: number;
  };

  monthlyCollection: {
    month: string;
    total: number;
  }[];

  buildings: {
    id: number;
    name: string;
    totalFlats: number;
    occupied: number;
    vacant: number;
    rented: number;
    maintenance: number;
    occupancyPercentage: number;
  }[];

  recentActivity: {
    id: number;
    action: string;
    entityType: string;
    entityId: number | null;
    createdAt: string;
    userName: string;
  }[];
}

export async function getAdminAnalytics() {
  const response =
    await api.get(
      "/admin/analytics"
    );

  return response.data;
}
