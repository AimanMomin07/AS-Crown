import api from "./axios";


/*
|--------------------------------------------------------------------------
| REGISTER DATA
|--------------------------------------------------------------------------
*/

export interface RegisterData {

  firstName: string;

  lastName?: string;

  email?: string;

  mobile?: string;

  password: string;

  flatNumber?: string;

  buildingName?: string;

  wing?: string;

}


/*
|--------------------------------------------------------------------------
| LOGIN DATA
|--------------------------------------------------------------------------
*/

export interface LoginData {

  identifier: string;

  password: string;

}


/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
*/

export async function registerUser(
  data: RegisterData
) {

  const response =
    await api.post(
      "/auth/register",
      data
    );

  return response.data;

}


/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

export async function loginUser(
  data: LoginData
) {

  const response =
    await api.post(
      "/auth/login",
      data
    );

  return response.data;

}


/*
|--------------------------------------------------------------------------
| CURRENT USER
|--------------------------------------------------------------------------
*/

export async function getCurrentUser() {

  const response =
    await api.get(
      "/auth/me"
    );

  return response.data;

}

/*
|--------------------------------------------------------------------------
| FIREBASE PHONE PASSWORD RESET
|--------------------------------------------------------------------------
*/

export async function resetPasswordWithFirebase(
  data: {
    idToken: string;
    newPassword: string;
  }
) {

  const response =
    await api.post(
      "/auth/forgot-password/firebase-reset",
      data
    );

  return response.data;

}
