import {
  Navigate,
  Outlet,
  useLocation
} from "react-router-dom";

import {
  useAuth
} from "../context/AuthContext";


interface ProtectedRouteProps {

  allowedRoles?: string[];

}


export default function ProtectedRoute({
  allowedRoles
}: ProtectedRouteProps) {

  const location = useLocation();

  const {
    user,
    loading,
    isAuthenticated
  } =
    useAuth();

  const role =
    user?.role ||
    user?.role_name ||
    "";

  const routeRoles =
    allowedRoles ||
    (location.pathname.startsWith("/admin/")
      ? ["admin"]
      : location.pathname.startsWith("/resident/")
        ? ["resident"]
        : location.pathname.startsWith("/security/")
          ? ["security"]
          : location.pathname.startsWith("/staff/")
            ? ["staff"]
            : location.pathname.startsWith("/committee/")
              ? ["committee"]
              : location.pathname === "/admin"
                ? ["admin"]
                : location.pathname === "/resident"
                  ? ["resident"]
                  : location.pathname === "/security"
                    ? ["security"]
                    : location.pathname === "/staff"
                      ? ["staff"]
                      : location.pathname === "/committee"
                        ? ["committee"]
                        : undefined);


  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {

    return (

      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center"
        }}
      >

        Loading AS CROWN...

      </div>

    );

  }


  /*
  |--------------------------------------------------------------------------
  | NOT LOGGED IN
  |--------------------------------------------------------------------------
  */

  if (!isAuthenticated) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }


  /*
  |--------------------------------------------------------------------------
  | ROLE RESTRICTION
  |--------------------------------------------------------------------------
  */

  if (
    routeRoles &&
    !routeRoles.includes(role)
  ) {

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );

  }


  return <Outlet />;

}