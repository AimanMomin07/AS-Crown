export type UserRole =
  | "admin"
  | "resident"
  | "staff"
  | "security"
  | "committee";


export interface User {

  id: number;

  first_name?: string;

  last_name?: string;

  firstName?: string;

  lastName?: string;

  email?: string | null;

  mobile?: string | null;

  phone?: string | null;

  profile_image?: string | null;

  role_id?: number;

  role_name?: string;

  role?: UserRole;

  status: string;

  flat_number?: string | null;

  building_name?: string | null;

  wing?: string | null;

  ownership_type?:
    | "owner"
    | "tenant"
    | "family";

}


export interface AuthState {

  user: User | null;

  token: string | null;

  loading: boolean;

  isAuthenticated: boolean;

}