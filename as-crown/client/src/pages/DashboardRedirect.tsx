import {
  Navigate
} from "react-router-dom";

import {
  useAuth
} from "../context/AuthContext";


export default function DashboardRedirect() {

  const {
    user,
    loading,
    isAuthenticated
  } =
    useAuth();


  if (loading) {

    return (

      <div
        style={{
          minHeight:
            "100vh",

          display:
            "grid",

          placeItems:
            "center",

          color:
            "#475569",

          fontFamily:
            "Inter, sans-serif"
        }}
      >

        Loading AS CROWN...

      </div>

    );

  }


  if (!isAuthenticated) {

    return (

      <Navigate
        to="/login"
        replace
      />

    );

  }


  const role =
    user?.role ||
    user?.role_name;


  switch (role) {

    case "admin":

      return (
        <Navigate
          to="/admin/dashboard"
          replace
        />
      );


    case "resident":

      return (
        <Navigate
          to="/resident"
          replace
        />
      );


    case "staff":

      return (
        <Navigate
          to="/staff"
          replace
        />
      );


    case "security":

      return (
        <Navigate
          to="/security"
          replace
        />
      );


    case "committee":

      return (
        <Navigate
          to="/committee"
          replace
        />
      );


    default:

      return (
        <Navigate
          to="/login"
          replace
        />
      );

  }

}