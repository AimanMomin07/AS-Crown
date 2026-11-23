import api from "./axios";


/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

export async function getAdminDashboard() {

  const response =
    await api.get(
      "/admin/dashboard"
    );

  return response.data;

}

export async function uploadAdminProfileImage(
  id: number,
  file: File
) {

  const formData =
    new FormData();

  formData.append(
    "profile",
    file
  );

  const response =
    await api.post(
      `/admin/users/${id}/profile-image`,
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data"
        }
      }
    );

  return response.data;
}

/*
|--------------------------------------------------------------------------
| USERS
|--------------------------------------------------------------------------
*/

export interface AdminUser {

  id: number;

  first_name: string;

  last_name?: string | null;

  email?: string | null;

  mobile?: string | null;

  phone?: string | null;

  profile_image?: string | null;

  status: string;

  is_email_verified: boolean;

  is_phone_verified: boolean;

  last_login_at?: string | null;

  created_at: string;

  role_id?: number;

  role_name?: string;

}


/*
|--------------------------------------------------------------------------
| GET USERS
|--------------------------------------------------------------------------
*/

export async function getAdminUsers(
  params?: {

    search?: string;

    role?: string;

    status?: string;

    page?: number;

    limit?: number;

  }
) {

  const response =
    await api.get(
      "/admin/users",
      {
        params
      }
    );

  return response.data;

}


/*
|--------------------------------------------------------------------------
| GET USER
|--------------------------------------------------------------------------
*/

export async function getAdminUser(
  id: number
) {

  const response =
    await api.get(
      `/admin/users/${id}`
    );

  return response.data;

}


/*
|--------------------------------------------------------------------------
| CREATE USER
|--------------------------------------------------------------------------
*/

export async function createAdminUser(
  data: {

    firstName: string;

    lastName?: string;

    email?: string;

    mobile?: string;

    password: string;

    roleId: number;

    status?: string;

  }
) {

  const response =
    await api.post(
      "/admin/users",
      data
    );

  return response.data;

}


/*
|--------------------------------------------------------------------------
| UPDATE STATUS
|--------------------------------------------------------------------------
*/
export async function updateAdminUser(
  id: number,
  data: {
    firstName: string;
    lastName?: string;
    mobile?: string;
  }
) {

  const response =
    await api.put(
      `/admin/users/${id}`,
      data
    );

  return response.data;

}

export async function updateAdminUserStatus(
  id: number,
  status: string
) {

  const response =
    await api.patch(
      `/admin/users/${id}/status`,
      {
        status
      }
    );

  return response.data;

}