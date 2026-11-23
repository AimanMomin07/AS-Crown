import {
  useState
} from "react";

import type {
  FormEvent
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

import {
  useAuth
} from "../../context/AuthContext";


function getErrorMessage(
  error: unknown
) {

  if (
    typeof error ===
    "object" &&
    error !== null &&
    "response" in error
  ) {

    const response =
      (
        error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        }
      ).response;

    return (
      response?.data?.message ||
      "Unable to sign in. Please check your credentials."
    );

  }

  return (
    error instanceof Error
      ? error.message
      : "Unable to sign in. Please check your credentials."
  );

}


export default function Login() {

  const navigate =
    useNavigate();

  const {
    login
  } =
    useAuth();


  const [
    identifier,
    setIdentifier
  ] =
    useState("");


  const [
    password,
    setPassword
  ] =
    useState("");


  const [
    showPassword,
    setShowPassword
  ] =
    useState(false);


  const [
    error,
    setError
  ] =
    useState("");


  const [
    loading,
    setLoading
  ] =
    useState(false);


  async function handleSubmit(
    event: FormEvent
  ) {

    event.preventDefault();

    setError("");

    setLoading(true);


    try {

      await login({
        identifier:
          identifier.trim(),
        password
      });


      navigate(
        "/dashboard",
        {
          replace: true
        }
      );

    } catch (
      error: unknown
    ) {

      setError(
        getErrorMessage(
          error
        )
      );

    } finally {

      setLoading(false);

    }

  }


  return (

    <div
      className="as-login-shell"
      style={{
        minHeight:
          "100vh",

        display:
          "grid",

        gridTemplateColumns:
          "minmax(0, 1.08fr) minmax(420px, .92fr)",

        background:
          "#f4f7fb",

        position:
          "relative"
      }}
    >

      <section
        style={{
          padding:
            "64px",

          display:
            "flex",

          flexDirection:
            "column",

          justifyContent:
            "space-between",

          background:
            "linear-gradient(145deg,#08111f 0%,#10264a 58%,#17437a 100%)",

          position:
            "relative",

          overflow:
            "hidden"
        }}
      >

        <div>

          <div
            style={{
              display:
                "flex",

              alignItems:
                "center",

              gap:
                "12px",

              color:
                "white",

              fontWeight:
                800,

              fontSize:
                "22px"
            }}
          >

            <ShieldCheck
              size={30}
            />

            AS CROWN

          </div>


          <div
            style={{
              maxWidth:
                "620px",

              marginTop:
                "120px",

              color:
                "white"
            }}
          >

            <p
              style={{
                textTransform:
                  "uppercase",

                letterSpacing:
                  "3px",

                fontSize:
                  "12px",

                opacity:
                  0.65,

                fontWeight:
                  700
              }}
            >
              SMART SOCIETY MANAGEMENT
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginTop: "28px"
              }}
            >
              {["Residents", "Security", "Staff", "Committee"].map(role => (
                <span
                  key={role}
                  style={{
                    border: "1px solid rgba(255,255,255,.18)",
                    background: "rgba(255,255,255,.08)",
                    color: "rgba(255,255,255,.82)",
                    borderRadius: 999,
                    padding: "7px 11px",
                    fontSize: 11,
                    fontWeight: 700
                  }}
                >
                  {role}
                </span>
              ))}
            </div>

            <h1
              style={{
                fontSize:
                  "clamp(42px,5vw,72px)",

                lineHeight:
                  1.02,

                margin:
                  "18px 0"
              }}
            >
              Your society.
              <br />
              Smarter than ever.
            </h1>

            <p
              style={{
                fontSize:
                  "18px",

                lineHeight:
                  1.7,

                color:
                  "rgba(255,255,255,.72)",

                maxWidth:
                  "520px"
              }}
            >
              A modern digital platform for
              residents, administrators,
              security teams and society
              committees.
            </p>

          </div>

        </div>

        <div
          style={{
            color:
              "rgba(255,255,255,.5)",

            fontSize:
              "13px"
          }}
        >
          © 2026 AS CROWN.
          All rights reserved.
        </div>

      </section>


      <section
        style={{
          display:
            "grid",

          placeItems:
            "center",

          padding:
            "32px clamp(24px, 6vw, 88px)",

          background:
            "linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)"
        }}
      >

        <div
          style={{
            width:
              "100%",

            maxWidth:
              "440px",

            background:
              "rgba(255,255,255,.92)",

            border:
              "1px solid #e2e8f0",

            borderRadius:
              "20px",

            padding:
              "34px",

            boxShadow:
              "0 22px 60px rgba(15,23,42,.09)"
          }}
        >

          <div
            style={{
              marginBottom:
                "32px"
            }}
          >

            <h2
              style={{
                margin:
                  "0 0 10px",

                fontSize:
                  "34px",

                color:
                  "#0f172a",

                fontFamily:
                  '"Manrope", sans-serif'
              }}
            >
              Welcome back
            </h2>

            <p
              style={{
                margin: 0,

                color:
                  "#64748b"
              }}
            >
              Sign in to your AS CROWN account.
            </p>

          </div>


          {error && (

            <div
              style={{
                background:
                  "#fef2f2",

                color:
                  "#b91c1c",

                border:
                  "1px solid #fecaca",

                borderRadius:
                  "12px",

                padding:
                  "14px 16px",

                marginBottom:
                  "18px",

                fontSize:
                  "13px",

                lineHeight:
                  1.5
              }}
            >
              {error}
            </div>

          )}


          <form
            onSubmit={
              handleSubmit
            }
          >

            <label
              style={{
                display:
                  "block",

                marginBottom:
                  "18px"
              }}
            >

              <span
                style={{
                  display:
                    "block",

                  marginBottom:
                    "7px",

                  fontSize:
                    "14px",

                  fontWeight:
                    600
                }}
              >
                Email or mobile
              </span>

              <input
                value={
                  identifier
                }

                onChange={
                  event =>
                    setIdentifier(
                      event.target.value
                    )
                }

                placeholder = "you@example.com or 9876543210"

                required

                autoComplete = "username"

                style={
                  inputStyle
                }
              />

            </label>


            <div
              style={{
                display:
                  "flex",

                justifyContent:
                  "space-between",

                alignItems:
                  "center",

                marginBottom:
                  "7px"
              }}
            >

              <span
                style={{
                  fontSize:
                    "14px",

                  fontWeight:
                    600
                }}
              >
                Password
              </span>

              <Link
                to="/forgot-password"
                style={{
                  color:
                    "#2563eb",

                  fontSize:
                    "13px",

                  textDecoration:
                    "none"
                }}
              >
                Forgot password?
              </Link>

            </div>


            <div
              style={{
                position:
                  "relative",

                marginBottom:
                  "24px"
              }}
            >

              <LockKeyhole
                size={18}
                style={{
                  position:
                    "absolute",

                  left:
                    "14px",

                  top:
                    "50%",

                  transform:
                    "translateY(-50%)",

                  color:
                    "#94a3b8"
                }}
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }

                value={
                  password
                }

                onChange={
                  event =>
                    setPassword(
                      event.target.value
                    )
                }

                placeholder = "Enter your password"

                required

                autoComplete =  "current-password"

                style={{
                  ...inputStyle,

                  paddingLeft:
                    "43px",

                  paddingRight:
                    "45px"
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    value =>
                      !value
                  )
                }
                style={{
                  position:
                    "absolute",

                  right:
                    "10px",

                  top:
                    "50%",

                  transform:
                    "translateY(-50%)",

                  border: 0,

                  background:
                    "transparent",

                  cursor:
                    "pointer",

                  color:
                    "#64748b"
                }}
              >

                {showPassword
                  ? (
                    <EyeOff
                      size={18}
                    />
                  )
                  : (
                    <Eye
                      size={18}
                    />
                  )}

              </button>

            </div>


            <button
              type="submit"

              disabled={
                loading
              }

              style={{
                width:
                  "100%",

                height:
                  "54px",

                border: 0,

                borderRadius:
                  "12px",

                background:
                  loading
                    ? "#93c5fd"
                    : "linear-gradient(135deg,#2563eb,#1d4ed8)",

                color:
                  "white",

                fontWeight:
                  800,

                boxShadow:
                  loading
                    ? "none"
                    : "0 10px 22px rgba(37,99,235,.22)",

                cursor:
                  loading
                    ? "not-allowed"
                    : "pointer",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                gap:
                  "8px"
              }}
            >

              {loading
                ? "Signing in..."
                : "Sign in"}

              {!loading && (
                <ArrowRight
                  size={18}
                />
              )}

            </button>

          </form>


          <p
            style={{
              textAlign:
                "center",

              marginTop:
                "22px",

              color:
                "#64748b"
            }}
          >
            Don't have an account?{" "}

            <Link
              to="/register"
              style={{
                color:
                  "#2563eb",

                fontWeight:
                  700,

                textDecoration:
                  "none"
              }}
            >
              Create account
            </Link>

          </p>

        </div>

      </section>

    </div>

  );

}


const inputStyle:
  React.CSSProperties = {

    width:
      "100%",

    height:
      "50px",

    boxSizing:
      "border-box",

    padding:
      "0 14px",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      "12px",

    outline:
      "none",

    fontSize:
      "14px",

    background:
      "#ffffff",

    color:
      "#0f172a"

  };