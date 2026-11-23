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
  User,
  Mail,
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

import {
  useAuth
} from "../../context/AuthContext";


export default function Register() {

  const navigate =
    useNavigate();


  const {
    register
  } =
    useAuth();


  const [
    firstName,
    setFirstName
  ] =
    useState("");


  const [
    lastName,
    setLastName
  ] =
    useState("");


  const [
    email,
    setEmail
  ] =
    useState("");


  const [
    mobile,
    setMobile
  ] =
    useState("");


  const [
    password,
    setPassword
  ] =
    useState("");


  const [
    confirmPassword,
    setConfirmPassword
  ] =
    useState("");


  const [
    buildingName,
    setBuildingName
  ] =
    useState("");


  const [
    wing,
    setWing
  ] =
    useState("");


  const [
    flatNumber,
    setFlatNumber
  ] =
    useState("");


  const [
    showPassword,
    setShowPassword
  ] =
    useState(false);


  const [
    showConfirmPassword,
    setShowConfirmPassword
  ] =
    useState(false);


  const [
    terms,
    setTerms
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


    /*
    |--------------------------------------------------------------------------
    | PASSWORD VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      password !==
      confirmPassword
    ) {

      setError(
        "Passwords do not match."
      );

      return;

    }


    if (
      password.length < 8
    ) {

      setError(
        "Password must contain at least 8 characters."
      );

      return;

    }


    /*
    |--------------------------------------------------------------------------
    | EMAIL / MOBILE VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      !email &&
      !mobile
    ) {

      setError(
        "Please provide an email address or mobile number."
      );

      return;

    }


    /*
    |--------------------------------------------------------------------------
    | TERMS VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!terms) {

      setError(
        "Please accept the terms and conditions."
      );

      return;

    }


    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    setLoading(true);


    try {

      await register({

        firstName,

        lastName,

        email:
          email || undefined,

        mobile:
          mobile || undefined,

        password,

        flatNumber:
          flatNumber || undefined,

        buildingName:
          buildingName || undefined,

        wing:
          wing || undefined

      });


      /*
      |--------------------------------------------------------------------------
      | REGISTRATION SUCCESS
      |--------------------------------------------------------------------------
      */

      navigate(
        "/dashboard",
        {
          replace: true
        }
      );


    } catch (error: unknown) {

  if (
    typeof error === "object" &&
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

    setError(
      response?.data?.message ||
      "Unable to create your account."
    );

  } else if (
    error instanceof Error
  ) {

    setError(
      error.message
    );

  } else {

    setError(
      "Unable to create your account."
    );

  }

} finally {

      setLoading(false);

    }

  }


  /*
  |--------------------------------------------------------------------------
  | INPUT STYLE
  |--------------------------------------------------------------------------
  */

  const inputStyle = {

    width: "100%",

    boxSizing:
      "border-box" as const,

    height: "50px",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      "11px",

    padding:
      "0 14px 0 44px",

    fontSize:
      "14px",

    outline:
      "none"

  };


  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (

    <div
      style={{

        minHeight:
          "100vh",

        background:
          "#f5f7fb",

        padding:
          "40px 20px"

      }}
    >

      <div
        style={{

          maxWidth:
            "1050px",

          margin:
            "0 auto",

          display:
            "grid",

          gridTemplateColumns:
            "0.8fr 1.2fr",

          background:
            "white",

          borderRadius:
            "24px",

          overflow:
            "hidden",

          boxShadow:
            "0 25px 70px rgba(15,23,42,.10)"

        }}
      >


        {/* ================================================================
            BRAND SECTION
        ================================================================= */}

        <div
          style={{

            background:
              "linear-gradient(145deg,#0f172a,#1e3a8a)",

            color:
              "white",

            padding:
              "48px",

            display:
              "flex",

            flexDirection:
              "column",

            justifyContent:
              "space-between"

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
                  "10px",

                fontWeight:
                  800,

                fontSize:
                  "21px"

              }}
            >

              <ShieldCheck
                size={28}
              />

              AS CROWN

            </div>


            <div
              style={{

                marginTop:
                  "90px"

              }}
            >

              <p
                style={{

                  textTransform:
                    "uppercase",

                  letterSpacing:
                    "2px",

                  fontSize:
                    "11px",

                  opacity:
                    0.6

                }}
              >

                JOIN THE COMMUNITY

              </p>


              <h1
                style={{

                  fontSize:
                    "42px",

                  lineHeight:
                    1.05

                }}
              >

                Everything your
                society needs.

              </h1>


              <p
                style={{

                  color:
                    "rgba(255,255,255,.7)",

                  lineHeight:
                    1.7

                }}
              >

                Connect with your society,
                manage your home, raise
                complaints and stay informed
                from one secure platform.

              </p>

            </div>

          </div>


          <p
            style={{

              fontSize:
                "12px",

              opacity:
                0.5

            }}
          >

            AS CROWN Society Management

          </p>

        </div>


        {/* ================================================================
            FORM SECTION
        ================================================================= */}

        <div
          style={{

            padding:
              "48px"

          }}
        >

          <h2
            style={{

              margin:
                "0 0 8px",

              fontSize:
                "30px"

            }}
          >

            Create your account

          </h2>


          <p
            style={{

              color:
                "#64748b",

              marginTop:
                0,

              marginBottom:
                "28px"

            }}
          >

            Register as an AS CROWN resident.

          </p>


          {/* ==============================================================
              ERROR
          =============================================================== */}

          {error && (

            <div
              style={{

                padding:
                  "13px 15px",

                background:
                  "#fef2f2",

                color:
                  "#b91c1c",

                border:
                  "1px solid #fecaca",

                borderRadius:
                  "10px",

                marginBottom:
                  "20px",

                fontSize:
                  "13px"

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


            {/* ============================================================
                NAME
            ============================================================= */}

            <div
              style={{

                display:
                  "grid",

                gridTemplateColumns:
                  "1fr 1fr",

                gap:
                  "14px"

              }}
            >

              <div>

                <label>
                  First name
                </label>


                <div
                  style={{

                    position:
                      "relative",

                    marginTop:
                      "7px",

                    marginBottom:
                      "18px"

                  }}
                >

                  <User
                    size={17}
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
                    value={
                      firstName
                    }

                    onChange={
                      e =>
                        setFirstName(
                          e.target.value
                        )
                    }

                    required

                    placeholder="Aiman"

                    style={
                      inputStyle
                    }

                  />

                </div>

              </div>


              <div>

                <label>
                  Last name
                </label>


                <input
                  value={
                    lastName
                  }

                  onChange={
                    e =>
                      setLastName(
                        e.target.value
                      )
                  }

                  placeholder="Momin"

                  style={{

                    ...inputStyle,

                    marginTop:
                      "7px",

                    paddingLeft:
                      "14px"

                  }}

                />

              </div>

            </div>


            {/* ============================================================
                EMAIL + MOBILE
            ============================================================= */}

            <div
              style={{

                display:
                  "grid",

                gridTemplateColumns:
                  "1fr 1fr",

                gap:
                  "14px"

              }}
            >

              <div>

                <label>
                  Email
                </label>


                <div
                  style={{

                    position:
                      "relative",

                    marginTop:
                      "7px",

                    marginBottom:
                      "18px"

                  }}
                >

                  <Mail
                    size={17}

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
                    type="email"

                    value={
                      email
                    }

                    onChange={
                      e =>
                        setEmail(
                          e.target.value
                        )
                    }

                    placeholder="you@example.com"

                    style={
                      inputStyle
                    }

                  />

                </div>

              </div>


              <div>

                <label>
                  Mobile
                </label>


                <div
                  style={{

                    position:
                      "relative",

                    marginTop:
                      "7px",

                    marginBottom:
                      "18px"

                  }}
                >

                  <Phone
                    size={17}

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
                    type="tel"

                    value={
                      mobile
                    }

                    onChange={
                      e =>
                        setMobile(
                          e.target.value
                        )
                    }

                    placeholder="9876543210"

                    maxLength={15}

                    style={
                      inputStyle
                    }

                  />

                </div>

              </div>

            </div>


            {/* ============================================================
                PROPERTY
            ============================================================= */}

            <div
              style={{

                display:
                  "grid",

                gridTemplateColumns:
                  "1fr 1fr 1fr",

                gap:
                  "14px"

              }}
            >

              <div>

                <label>
                  Building
                </label>


                <input
                  value={
                    buildingName
                  }

                  onChange={
                    e =>
                      setBuildingName(
                        e.target.value
                      )
                  }

                  placeholder="AS CROWN"

                  style={{

                    ...inputStyle,

                    marginTop:
                      "7px",

                    paddingLeft:
                      "14px"

                  }}

                />

              </div>


              <div>

                <label>
                  Wing
                </label>


                <input
                  value={
                    wing
                  }

                  onChange={
                    e =>
                      setWing(
                        e.target.value
                      )
                  }

                  placeholder="A"

                  style={{

                    ...inputStyle,

                    marginTop:
                      "7px",

                    paddingLeft:
                      "14px"

                  }}

                />

              </div>


              <div>

                <label>
                  Flat
                </label>


                <input
                  value={
                    flatNumber
                  }

                  onChange={
                    e =>
                      setFlatNumber(
                        e.target.value
                      )
                  }

                  placeholder="A-101"

                  style={{

                    ...inputStyle,

                    marginTop:
                      "7px",

                    paddingLeft:
                      "14px"

                  }}

                />

              </div>

            </div>


            {/* ============================================================
                PASSWORD
            ============================================================= */}

            <div
              style={{

                marginTop:
                  "18px"

              }}
            >

              <label>
                Password
              </label>


              <div
                style={{

                  position:
                    "relative",

                  marginTop:
                    "7px",

                  marginBottom:
                    "18px"

                }}
              >

                <LockKeyhole
                  size={17}

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
                    e =>
                      setPassword(
                        e.target.value
                      )
                  }

                  required

                  minLength={8}

                  placeholder="Minimum 8 characters"

                  style={
                    inputStyle
                  }

                />


                <button
                  type="button"

                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }

                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }

                  style={{

                    position:
                      "absolute",

                    right:
                      "12px",

                    top:
                      "50%",

                    transform:
                      "translateY(-50%)",

                    background:
                      "transparent",

                    border:
                      0,

                    cursor:
                      "pointer",

                    color:
                      "#64748b"

                  }}
                >

                  {showPassword

                    ? (
                      <EyeOff
                        size={17}
                      />
                    )

                    : (
                      <Eye
                        size={17}
                      />
                    )

                  }

                </button>

              </div>

            </div>


            {/* ============================================================
                CONFIRM PASSWORD
            ============================================================= */}

            <div>

              <label>
                Confirm password
              </label>


              <div
                style={{

                  position:
                    "relative",

                  marginTop:
                    "7px",

                  marginBottom:
                    "20px"

                }}
              >

                <LockKeyhole
                  size={17}

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
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }

                  value={
                    confirmPassword
                  }

                  onChange={
                    e =>
                      setConfirmPassword(
                        e.target.value
                      )
                  }

                  required

                  placeholder="Repeat your password"

                  style={{
                    ...inputStyle,

                    paddingRight:
                      "45px"

                  }}

                />


                {/* SHOW/HIDE CONFIRM PASSWORD */}

                <button
                  type="button"

                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }

                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }

                  style={{

                    position:
                      "absolute",

                    right:
                      "12px",

                    top:
                      "50%",

                    transform:
                      "translateY(-50%)",

                    background:
                      "transparent",

                    border:
                      0,

                    cursor:
                      "pointer",

                    color:
                      "#64748b"

                  }}
                >

                  {showConfirmPassword

                    ? (
                      <EyeOff
                        size={17}
                      />
                    )

                    : (
                      <Eye
                        size={17}
                      />
                    )

                  }

                </button>

              </div>

            </div>


            {/* ============================================================
                TERMS
            ============================================================= */}

            <label
              style={{

                display:
                  "flex",

                gap:
                  "10px",

                alignItems:
                  "flex-start",

                fontSize:
                  "13px",

                color:
                  "#64748b",

                marginBottom:
                  "20px",

                cursor:
                  "pointer"

              }}
            >

              <input
                type="checkbox"

                checked={
                  terms
                }

                onChange={
                  e =>
                    setTerms(
                      e.target.checked
                    )
                }

                style={{
                  marginTop:
                    "3px"
                }}

              />


              <span>

                I agree to the AS CROWN
                terms and privacy policy.

              </span>

            </label>


            {/* ============================================================
                SUBMIT
            ============================================================= */}

            <button
              disabled={
                loading
              }

              type="submit"

              style={{

                width:
                  "100%",

                height:
                  "52px",

                border:
                  0,

                borderRadius:
                  "11px",

                background:
                  loading
                    ? "#93c5fd"
                    : "#2563eb",

                color:
                  "white",

                fontWeight:
                  700,

                cursor:
                  loading
                    ? "not-allowed"
                    : "pointer",

                display:
                  "flex",

                justifyContent:
                  "center",

                alignItems:
                  "center",

                gap:
                  "9px"

              }}
            >

              {loading

                ? "Creating account..."

                : "Create account"

              }


              {!loading && (

                <ArrowRight
                  size={18}
                />

              )}

            </button>


          </form>


          {/* ==============================================================
              LOGIN LINK
          =============================================================== */}

          <p
            style={{

              textAlign:
                "center",

              color:
                "#64748b",

              fontSize:
                "14px",

              marginTop:
                "24px"

            }}
          >

            Already have an account?{" "}


            <Link
              to="/login"

              style={{

                color:
                  "#2563eb",

                fontWeight:
                  700,

                textDecoration:
                  "none"

              }}
            >

              Sign in

            </Link>

          </p>


        </div>

      </div>

    </div>

  );

}