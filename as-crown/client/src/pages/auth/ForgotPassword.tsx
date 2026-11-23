import {
  useEffect,
  useRef,
  useState
} from "react";


import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  Phone,
  RefreshCw,
  ShieldCheck
} from "lucide-react";


import {
  Link,
  useNavigate
} from "react-router-dom";


import {
  type ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";


import {
  getFirebaseAuth
} from "../../config/firebase";


import {
  resetPasswordWithFirebase
} from "../../api/auth.api";


type Step =
  | "phone"
  | "otp"
  | "reset"
  | "success";


export default function ForgotPassword() {

  const navigate =
    useNavigate();


  const [
    step,
    setStep
  ] =
    useState<Step>(
      "phone"
    );


  const [
    mobile,
    setMobile
  ] =
    useState("");


  const [
    otp,
    setOtp
  ] =
    useState("");


  const [
    newPassword,
    setNewPassword
  ] =
    useState("");


  const [
    confirmPassword,
    setConfirmPassword
  ] =
    useState("");


  const [
    loading,
    setLoading
  ] =
    useState(false);


  const [
    error,
    setError
  ] =
    useState("");


  const [
    success,
    setSuccess
  ] =
    useState("");


  const recaptchaRef =
    useRef<
      RecaptchaVerifier |
      null
    >(null);


  const confirmationRef =
    useRef<
      ConfirmationResult |
      null
    >(null);


  const firebaseIdTokenRef =
    useRef<
      string |
      null
    >(null);


  useEffect(
    () => {

      return () => {

        try {

          recaptchaRef
            .current
            ?.clear();

        } catch {
          // cleanup
        }

      };

    },
    []
  );


  function normalizeIndianMobile(
    value: string
  ) {

    const digits =
      value
        .replace(
          /\D/g,
          ""
        );


    if (
      digits.startsWith("91") &&
      digits.length === 12
    ) {

      return `+${digits}`;

    }


    if (
      digits.length === 10
    ) {

      return `+91${digits}`;

    }


    return "";

  }


  function ensureRecaptcha() {

    if (
      recaptchaRef.current
    ) {

      return recaptchaRef.current;

    }


    const auth =
      getFirebaseAuth();


    recaptchaRef.current =
      new RecaptchaVerifier(
        auth,
        "firebase-recaptcha",
        {
          size:
            "normal",

          callback:
            () => {
              setError("");
            },

          "expired-callback":
            () => {
              setError(
                "Security verification expired. Please verify again."
              );
            }
        }
      );


    return recaptchaRef.current;

  }


  async function sendOtp() {

    setError("");
    setSuccess("");


    const phone =
      normalizeIndianMobile(
        mobile
      );


    if (
      !phone
    ) {

      setError(
        "Enter a valid 10-digit Indian mobile number."
      );

      return;

    }


    try {

      setLoading(
        true
      );


      const auth =
        getFirebaseAuth();


      const verifier =
        ensureRecaptcha();


      const confirmation =
        await signInWithPhoneNumber(
          auth,
          phone,
          verifier
        );


      confirmationRef.current =
        confirmation;


      setMobile(
        phone.slice(
          -10
        )
      );


      setOtp("");


      setSuccess(
        `OTP sent to +91 ${phone.slice(-10)}.`
      );


      setStep(
        "otp"
      );

    } catch (
      requestError: any
    ) {

      console.error(
        "Firebase SMS error:",
        requestError
      );


      try {

        recaptchaRef
          .current
          ?.clear();

      } catch {
        // ignore
      }


      recaptchaRef.current =
        null;


      const code =
        String(
          requestError
            ?.code ||
          ""
        );


      if (
        code ===
        "auth/invalid-phone-number"
      ) {

        setError(
          "The mobile number is invalid."
        );

      } else if (
        code ===
        "auth/too-many-requests"
      ) {

        setError(
          "Too many attempts. Please wait and try again."
        );

      } else if (
        code ===
        "auth/quota-exceeded"
      ) {

        setError(
          "Firebase SMS quota has been exceeded."
        );

      } else {

        setError(
          requestError
            ?.message ||
          "Unable to send the OTP."
        );

      }

    } finally {

      setLoading(
        false
      );

    }

  }


  async function verifyOtp() {

    setError("");
    setSuccess("");


    if (
      !/^\d{6}$/.test(
        otp
      )
    ) {

      setError(
        "Enter the 6-digit OTP."
      );

      return;

    }


    if (
      !confirmationRef.current
    ) {

      setError(
        "This OTP session has expired. Please request a new OTP."
      );

      setStep(
        "phone"
      );

      return;

    }


    try {

      setLoading(
        true
      );


      const credential =
        await confirmationRef
          .current
          .confirm(
            otp
          );


      firebaseIdTokenRef.current =
        await credential.user
          .getIdToken(
            true
          );


      setSuccess(
        "Mobile number verified successfully."
      );


      setStep(
        "reset"
      );

    } catch (
      requestError: any
    ) {

      console.error(
        "Firebase OTP verification error:",
        requestError
      );


      const code =
        String(
          requestError
            ?.code ||
          ""
        );


      if (
        code ===
        "auth/invalid-verification-code"
      ) {

        setError(
          "Incorrect OTP. Please try again."
        );

      } else if (
        code ===
        "auth/code-expired"
      ) {

        setError(
          "This OTP has expired. Request a new OTP."
        );

      } else {

        setError(
          requestError
            ?.message ||
          "Unable to verify OTP."
        );

      }

    } finally {

      setLoading(
        false
      );

    }

  }


  async function resetPassword() {

    setError("");
    setSuccess("");


    if (
      newPassword.length <
      8
    ) {

      setError(
        "Your new password must contain at least 8 characters."
      );

      return;

    }


    if (
      newPassword !==
      confirmPassword
    ) {

      setError(
        "The passwords do not match."
      );

      return;

    }


    if (
      !firebaseIdTokenRef.current
    ) {

      setError(
        "Your verification session has expired. Please start again."
      );

      setStep(
        "phone"
      );

      return;

    }


    try {

      setLoading(
        true
      );


      await resetPasswordWithFirebase({

        idToken:
          firebaseIdTokenRef.current,

        newPassword

      });


      try {

        await getFirebaseAuth()
          .signOut();

      } catch {
        // ignore
      }


      confirmationRef.current =
        null;

      firebaseIdTokenRef.current =
        null;


      setSuccess(
        "Your AS CROWN password has been changed successfully."
      );


      setStep(
        "success"
      );

    } catch (
      requestError: any
    ) {

      console.error(
        "AS CROWN password reset error:",
        requestError
      );


      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
        "Unable to change your password."
      );

    } finally {

      setLoading(
        false
      );

    }

  }


  function startOver() {

    setStep(
      "phone"
    );

    setOtp("");

    setNewPassword("");

    setConfirmPassword("");

    setError("");

    setSuccess("");

    confirmationRef.current =
      null;

    firebaseIdTokenRef.current =
      null;


    try {

      recaptchaRef
        .current
        ?.clear();

    } catch {
      // ignore
    }


    recaptchaRef.current =
      null;

  }


  return (

    <div
      style={
        page
      }
    >

      <div
        style={
          shell
        }
      >

        <Link
          to="/login"
          style={
            backLink
          }
        >
          <ArrowLeft
            size={16}
          />

          Back to login
        </Link>


        <div
          style={
            card
          }
        >

          <div
            style={
              brandRow
            }
          >

            <div
              style={
                brandIcon
              }
            >

              <ShieldCheck
                size={24}
              />

            </div>


            <div>

              <div
                style={
                  brandName
                }
              >
                AS CROWN
              </div>

              <div
                style={
                  brandCaption
                }
              >
                SOCIETY MANAGEMENT
              </div>

            </div>

          </div>


          <div
            style={
              stepBadge
            }
          >

            {
              step ===
              "success"

                ? (
                  <CheckCircle2
                    size={22}
                  />
                )

                : (
                  <KeyRound
                    size={22}
                  />
                )
            }

          </div>


          <div
            style={
              eyebrow
            }
          >
            ACCOUNT RECOVERY
          </div>


          <h1
            style={
              title
            }
          >

            {
              step ===
                "phone"

                ? "Forgot your password?"

                : step ===
                  "otp"

                  ? "Verify your mobile"

                  : step ===
                    "reset"

                    ? "Create a new password"

                    : "Password updated"
            }

          </h1>


          <p
            style={
              description
            }
          >

            {
              step ===
                "phone"

                ? "Enter the mobile number registered with AS CROWN. We will send a secure one-time password."

                : step ===
                  "otp"

                  ? `Enter the 6-digit code sent to +91 ${mobile}.`

                  : step ===
                    "reset"

                    ? "Your mobile number has been verified. Set a new password for your account."

                    : "Your password has been changed successfully. You can now sign in."
            }

          </p>


          {
            error && (
              <div
                style={
                  alertError
                }
              >
                {error}
              </div>
            )
          }


          {
            success && (
              <div
                style={
                  alertSuccess
                }
              >
                {success}
              </div>
            )
          }


          {
            step ===
              "phone"
              && (

                <form
                  onSubmit={
                    event => {

                      event.preventDefault();

                      void sendOtp();

                    }
                  }
                >

                  <label
                    style={
                      label
                    }
                  >
                    Registered mobile number

                    <div
                      style={
                        inputWrap
                      }
                    >

                      <Phone
                        size={18}
                        style={
                          inputIcon
                        }
                      />


                      <span
                        style={
                          countryCode
                        }
                      >
                        +91
                      </span>


                      <input
                        type="tel"
                        inputMode="numeric"
                        value={
                          mobile
                        }
                        maxLength={
                          10
                        }
                        onChange={
                          event =>
                            setMobile(
                              event
                                .target
                                .value
                                .replace(
                                  /\D/g,
                                  ""
                                )
                                .slice(
                                  0,
                                  10
                                )
                            )
                        }
                        placeholder="9876543210"
                        style={
                          phoneInput
                        }
                        autoComplete="tel"
                      />

                    </div>

                  </label>


                  <div
                    id="firebase-recaptcha"
                    style={
                      recaptchaBox
                    }
                  />


                  <button
                    type="submit"
                    disabled={
                      loading
                    }
                    style={
                      primaryButton(
                        loading
                      )
                    }
                  >

                    {
                      loading
                        ? (
                          <>
                            <Loader2
                              size={17}
                            />

                            Sending OTP...
                          </>
                        )

                        : "Send OTP"
                    }

                  </button>


                  <div
                    style={
                      hint
                    }
                  >
                    <ShieldCheck
                      size={15}
                    />

                    <span>
                      Your password is changed only after Firebase verifies the registered mobile number.
                    </span>
                  </div>

                </form>

              )
          }


          {
            step ===
              "otp"
              && (

                <form
                  onSubmit={
                    event => {

                      event.preventDefault();

                      void verifyOtp();

                    }
                  }
                >

                  <label
                    style={
                      label
                    }
                  >
                    6-digit verification code

                    <input
                      value={
                        otp
                      }
                      onChange={
                        event =>
                          setOtp(
                            event
                              .target
                              .value
                              .replace(
                                /\D/g,
                                ""
                              )
                              .slice(
                                0,
                                6
                              )
                          )
                      }
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={
                        6
                      }
                      placeholder="123456"
                      style={
                        otpInput
                      }
                      autoFocus
                    />

                  </label>


                  <button
                    type="submit"
                    disabled={
                      loading
                    }
                    style={
                      primaryButton(
                        loading
                      )
                    }
                  >
                    {
                      loading
                        ? "Verifying..."
                        : "Verify OTP"
                    }
                  </button>


                  <button
                    type="button"
                    onClick={
                      startOver
                    }
                    disabled={
                      loading
                    }
                    style={
                      secondaryButton
                    }
                  >

                    <RefreshCw
                      size={15}
                    />

                    Use another number

                  </button>

                </form>

              )
          }


          {
            step ===
              "reset"
              && (

                <form
                  onSubmit={
                    event => {

                      event.preventDefault();

                      void resetPassword();

                    }
                  }
                >

                  <label
                    style={
                      label
                    }
                  >
                    New password

                    <input
                      type="password"
                      value={
                        newPassword
                      }
                      onChange={
                        event =>
                          setNewPassword(
                            event
                              .target
                              .value
                          )
                      }
                      placeholder="At least 8 characters"
                      style={
                        plainInput
                      }
                      autoComplete="new-password"
                    />

                  </label>


                  <label
                    style={
                      label
                    }
                  >
                    Confirm new password

                    <input
                      type="password"
                      value={
                        confirmPassword
                      }
                      onChange={
                        event =>
                          setConfirmPassword(
                            event
                              .target
                              .value
                          )
                      }
                      placeholder="Repeat your new password"
                      style={
                        plainInput
                      }
                      autoComplete="new-password"
                    />

                  </label>


                  <button
                    type="submit"
                    disabled={
                      loading
                    }
                    style={
                      primaryButton(
                        loading
                      )
                    }
                  >

                    {
                      loading
                        ? "Updating password..."
                        : "Reset Password"
                    }

                  </button>

                </form>

              )
          }


          {
            step ===
              "success"
              && (

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/login"
                    )
                  }
                  style={
                    primaryButton(
                      false
                    )
                  }
                >
                  Go to Login
                </button>

              )
          }

        </div>

      </div>

    </div>

  );
}


const page:
  React.CSSProperties = {

  minHeight:
    "100vh",

  background:
    "linear-gradient(135deg, #0f172a 0%, #111827 55%, #172554 100%)",

  display:
    "flex",

  alignItems:
    "center",

  justifyContent:
    "center",

  padding:
    24,

  boxSizing:
    "border-box"
};


const shell:
  React.CSSProperties = {

  width:
    "min(480px, 100%)"
};


const backLink:
  React.CSSProperties = {

  display:
    "inline-flex",

  alignItems:
    "center",

  gap:
    7,

  color:
    "#cbd5e1",

  textDecoration:
    "none",

  fontSize:
    13,

  marginBottom:
    14
};


const card:
  React.CSSProperties = {

  background:
    "rgba(255,255,255,.98)",

  border:
    "1px solid rgba(255,255,255,.2)",

  borderRadius:
    24,

  padding:
    30,

  boxSizing:
    "border-box",

  boxShadow:
    "0 30px 80px rgba(0,0,0,.35)"
};


const brandRow:
  React.CSSProperties = {

  display:
    "flex",

  alignItems:
    "center",

  gap:
    11,

  marginBottom:
    26
};


const brandIcon:
  React.CSSProperties = {

  width:
    44,

  height:
    44,

  borderRadius:
    12,

  display:
    "grid",

  placeItems:
    "center",

  background:
    "#eef2ff",

  color:
    "#4f46e5"
};


const brandName:
  React.CSSProperties = {

  fontWeight:
    800,

  fontSize:
    17,

  color:
    "#0f172a"
};


const brandCaption:
  React.CSSProperties = {

  fontSize:
    9,

  letterSpacing:
    1.3,

  color:
    "#94a3b8",

  marginTop:
    2,

  fontWeight:
    700
};


const stepBadge:
  React.CSSProperties = {

  width:
    48,

  height:
    48,

  borderRadius:
    14,

  background:
    "#eef2ff",

  color:
    "#4f46e5",

  display:
    "grid",

  placeItems:
    "center",

  marginBottom:
    16
};


const eyebrow:
  React.CSSProperties = {

  fontSize:
    10,

  fontWeight:
    800,

  letterSpacing:
    1.4,

  color:
    "#4f46e5",

  marginBottom:
    7
};


const title:
  React.CSSProperties = {

  margin:
    0,

  color:
    "#0f172a",

  fontSize:
    28,

  lineHeight:
    1.2
};


const description:
  React.CSSProperties = {

  margin:
    "10px 0 22px",

  color:
    "#64748b",

  fontSize:
    13,

  lineHeight:
    1.6
};


const label:
  React.CSSProperties = {

  display:
    "grid",

  gap:
    8,

  color:
    "#334155",

  fontSize:
    12,

  fontWeight:
    800,

  marginBottom:
    16
};


const inputWrap:
  React.CSSProperties = {

  position:
    "relative",

  display:
    "flex",

  alignItems:
    "center"
};


const inputIcon:
  React.CSSProperties = {

  position:
    "absolute",

  left:
    13,

  color:
    "#94a3b8",

  zIndex:
    2
};


const countryCode:
  React.CSSProperties = {

  position:
    "absolute",

  left:
    38,

  color:
    "#475569",

  fontSize:
    13,

  fontWeight:
    700,

  zIndex:
    2
};


const phoneInput:
  React.CSSProperties = {

  width:
    "100%",

  height:
    48,

  boxSizing:
    "border-box",

  border:
    "1px solid #dbeafe",

  background:
    "#f8fafc",

  borderRadius:
    12,

  padding:
    "0 12px 0 72px",

  outline:
    "none",

  fontSize:
    14,

  color:
    "#0f172a"
};


const plainInput:
  React.CSSProperties = {

  width:
    "100%",

  height:
    48,

  boxSizing:
    "border-box",

  border:
    "1px solid #dbeafe",

  background:
    "#f8fafc",

  borderRadius:
    12,

  padding:
    "0 13px",

  outline:
    "none",

  fontSize:
    14,

  color:
    "#0f172a"
};


const otpInput:
  React.CSSProperties = {

  width:
    "100%",

  height:
    62,

  boxSizing:
    "border-box",

  border:
    "1px solid #c7d2fe",

  background:
    "#f8fafc",

  borderRadius:
    12,

  padding:
    "0 14px",

  outline:
    "none",

  fontSize:
    27,

  letterSpacing:
    9,

  textAlign:
    "center",

  fontWeight:
    800,

  color:
    "#0f172a"
};


const recaptchaBox:
  React.CSSProperties = {

  minHeight:
    78,

  display:
    "flex",

  justifyContent:
    "center",

  margin:
    "2px 0 14px"
};


function primaryButton(
  disabled:
    boolean
): React.CSSProperties {

  return {

    width:
      "100%",

    minHeight:
      48,

    border:
      0,

    borderRadius:
      12,

    background:
      disabled
        ? "#94a3b8"
        : "#4f46e5",

    color:
      "white",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    gap:
      7,

    cursor:
      disabled
        ? "not-allowed"
        : "pointer",

    fontWeight:
      800,

    fontSize:
      13

  };

}


const secondaryButton:
  React.CSSProperties = {

  width:
    "100%",

  minHeight:
    46,

  marginTop:
    10,

  border:
    "1px solid #e2e8f0",

  borderRadius:
    12,

  background:
    "white",

  color:
    "#334155",

  display:
    "flex",

  alignItems:
    "center",

  justifyContent:
    "center",

  gap:
    7,

  cursor:
    "pointer",

  fontWeight:
    700,

  fontSize:
    12
};


const alertError:
  React.CSSProperties = {

  padding:
    "11px 12px",

  borderRadius:
    10,

  background:
    "#fef2f2",

  border:
    "1px solid #fecaca",

  color:
    "#b91c1c",

  fontSize:
    12,

  marginBottom:
    14
};


const alertSuccess:
  React.CSSProperties = {

  padding:
    "11px 12px",

  borderRadius:
    10,

  background:
    "#ecfdf5",

  border:
    "1px solid #bbf7d0",

  color:
    "#047857",

  fontSize:
    12,

  marginBottom:
    14
};


const hint:
  React.CSSProperties = {

  display:
    "flex",

  alignItems:
    "flex-start",

  gap:
    7,

  marginTop:
    15,

  padding:
    11,

  borderRadius:
    10,

  background:
    "#f8fafc",

  color:
    "#64748b",

  fontSize:
    10,

  lineHeight:
    1.5
};
