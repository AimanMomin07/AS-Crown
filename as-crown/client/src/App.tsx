import React from "react";

import {
  BrowserRouter
} from "react-router-dom";

import {
  AuthProvider
} from "./context/AuthContext";


import AppRoutes
  from "./routes/AppRoutes";


class AppErrorBoundary
  extends React.Component<
    {
      children:
        React.ReactNode;
    },
    {
      hasError:
        boolean;

      errorMessage:
        string;
    }
  > {

  state = {

    hasError:
      false,

    errorMessage:
      ""

  };


  static getDerivedStateFromError(
    error:
      unknown
  ) {

    return {

      hasError:
        true,

      errorMessage:
        error instanceof Error
          ? error.message
          : String(
              error
            )

    };

  }


  componentDidCatch(
    error:
      Error,

    errorInfo:
      React.ErrorInfo
  ) {

    console.error(
      "AS CROWN application error:",
      error,

      errorInfo
    );

  }


  render() {

    if (
      !this.state.hasError
    ) {

      return this.props.children;

    }


    return (

      <div
        style={{
          minHeight:
            "100vh",

          display:
            "grid",

          placeItems:
            "center",

          background:
            "#f8fafc",

          padding:
            24,

          boxSizing:
            "border-box"
        }}
      >

        <div
          style={{
            width:
              "min(640px, 100%)",

            background:
              "white",

            border:
              "1px solid #e2e8f0",

            borderRadius:
              18,

            padding:
              26,

            boxShadow:
              "0 20px 60px rgba(15,23,42,.08)"
          }}
        >

          <div
            style={{
              fontSize:
                12,

              fontWeight:
                800,

              color:
                "#2563eb",

              letterSpacing:
                1.2,

              marginBottom:
                8
            }}
          >
            AS CROWN
          </div>


          <h1
            style={{
              margin:
                "0 0 10px",

              color:
                "#0f172a",

              fontSize:
                26
            }}
          >
            The application could not start
          </h1>


          <p
            style={{
              margin:
                0,

              color:
                "#64748b",

              lineHeight:
                1.6
            }}
          >
            Open the browser console for the full error.
          </p>


          <pre
            style={{
              marginTop:
                18,

              padding:
                14,

              borderRadius:
                10,

              background:
                "#f8fafc",

              color:
                "#334155",

              whiteSpace:
                "pre-wrap",

              wordBreak:
                "break-word",

              fontSize:
                12
            }}
          >
            {
              this.state.errorMessage
            }
          </pre>

        </div>

      </div>

    );

  }

}


function App() {

  return (
    <BrowserRouter>

      <AuthProvider>

        <AppErrorBoundary>

          <AppRoutes />

        </AppErrorBoundary>

      </AuthProvider>

    </BrowserRouter>
  );

}


export default App;
