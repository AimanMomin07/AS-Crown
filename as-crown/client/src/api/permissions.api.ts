import api from "./axios";

export interface PermissionRow {
  id: number;
  name: string;
  description: string | null;
  allowed: number;
  role_id: number;
  role_name: string;
}

export async function getPermissions() {
  return (
    await api.get("/permissions")
  ).data;
}

export async function updatePermission(data: {
  role: string;
  permissionId: number;
  allowed: boolean;
}) {
  return (
    await api.put("/permissions", data)
  ).data;
}
