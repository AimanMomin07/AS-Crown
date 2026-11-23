import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  ScanLine,
  KeyRound,
  CheckCircle2,
  XCircle,
  Camera,
  StopCircle,
  ClipboardPaste
} from "lucide-react";

import {
  Html5Qrcode
} from "html5-qrcode";

import {
  verifyPreapproval
} from "../../api/visitor-preapproval.api";

import {
  PageHeader,
  SectionCard,
  Button,
  inputStyle
} from "../../components/ui/ui-kit";

function getVerificationErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response;
    if (typeof response === "object" && response !== null && "data" in response) {
      const data = response.data;
      if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") {
        return data.message;
      }
    }
  }

  return fallback;
}


export default function SecurityGateScan() {

  const [
    mode,
    setMode
  ] =
    useState<
      "camera" |
      "otp" |
      "token"
    >(
      "camera"
    );


  const [
    id,
    setId
  ] =
    useState("");


  const [
    otp,
    setOtp
  ] =
    useState("");


  const [
    token,
    setToken
  ] =
    useState("");


  const [
    result,
    setResult
  ] =
    useState<{
      ok:
        boolean;
      message:
        string;
    } |
      null>(
      null
    );


  const [
    busy,
    setBusy
  ] =
    useState(false);


  const scannerRef =
    useRef<
      Html5Qrcode |
      null
    >(null);


  const scanningRef =
    useRef(false);


  useEffect(
    () => {

      return () => {

        void stopScanner();

      };

    },
    []
  );


  async function stopScanner() {

    if (
      !scannerRef.current
    ) {

      return;

    }


    try {

      if (
        scanningRef.current
      ) {

        await scannerRef.current.stop();

      }

    } catch {
      // camera may already be stopped
    }


    try {

      await scannerRef.current.clear();

    } catch {
      // ignore cleanup
    }


    scanningRef.current =
      false;

    scannerRef.current =
      null;

  }


  async function startScanner() {

    setResult(
      null
    );


    await stopScanner();


    try {

      const scanner =
        new Html5Qrcode(
          "security-qr-reader"
        );


      scannerRef.current =
        scanner;


      await scanner.start(
        {
          facingMode:
            "environment"
        },
        {
          fps:
            10,

          qrbox:
            {
              width:
                250,

              height:
                250
            },

          aspectRatio:
            1

        },
        async (decodedText: string) => {

          if (
            busy ||
            !scannerRef.current
          ) {

            return;

          }


          setBusy(
            true
          );


          try {

            await scanner.stop();

          } catch {
            // ignore
          }


          scanningRef.current =
            false;


          try {

            const response =
              await verifyPreapproval({
                token:
                  decodedText
              });


            setResult({
              ok:
                true,

              message:
                response?.message ||
                "Visitor verified and checked in."
            });

          } catch (
            error: unknown
          ) {

            setResult({
              ok:
                false,

              message:
                getVerificationErrorMessage(
                  error,
                  "QR verification failed."
                )
            });

          } finally {

            setBusy(
              false
            );

          }

        },
        () => {
          // scanner naturally emits frequent decode errors;
          // don't show them as user-facing errors.
        }
      );


      scanningRef.current =
        true;

    } catch (
      error
    ) {

      console.error(
        "QR scanner error:",
        error
      );


      setResult({
        ok:
          false,

        message:
          "Unable to start the camera. Check browser camera permission and use HTTPS or localhost."
      });


      await stopScanner();

    }

  }


  async function verifyManual(
    event:
      React.FormEvent
  ) {

    event.preventDefault();

    setBusy(
      true
    );

    setResult(
      null
    );


    try {

      const payload =
        mode === "otp"
          ? {
              id:
                Number(
                  id
                ),

              otp
            }

          : {
              token
            };


      const response =
        await verifyPreapproval(
          payload
        );


      setResult({
        ok:
          true,

        message:
          response?.message ||
          "Visitor verified and checked in."
      });


      setId("");

      setOtp("");

      setToken("");

    } catch (
      error: unknown
    ) {

      setResult({
        ok:
          false,

        message:
          getVerificationErrorMessage(
            error,
            "Verification failed."
          )
      });

    } finally {

      setBusy(
        false
      );

    }

  }


  async function changeMode(
    next:
      "camera" |
      "otp" |
      "token"
  ) {

    setMode(
      next
    );

    setResult(
      null
    );


    if (
      next !== "camera"
    ) {

      await stopScanner();

    }

  }


  return (

    <div
      style={{
        maxWidth:
          640,

        margin:
          "0 auto",

        padding:
          24
      }}
    >

      <PageHeader
        icon={
          <ScanLine
            size={
              22
            }
          />
        }

        title="Gate Pass Verification"

        subtitle="Scan a resident QR pass or verify the backup ID + OTP at the gate."
      />


      <SectionCard>

        <div
          style={{
            display:
              "grid",

            gridTemplateColumns:
              "repeat(3, 1fr)",

            gap:
              8,

            marginBottom:
              18
          }}
        >

          <button
            type="button"
            onClick={() =>
              void changeMode(
                "camera"
              )
            }
            style={
              tabStyle(
                mode ===
                  "camera"
              )
            }
          >
            <Camera
              size={
                14
              }
            />

            Scan QR
          </button>


          <button
            type="button"
            onClick={() =>
              void changeMode(
                "otp"
              )
            }
            style={
              tabStyle(
                mode ===
                  "otp"
              )
            }
          >
            <KeyRound
              size={
                14
              }
            />

            ID + OTP
          </button>


          <button
            type="button"
            onClick={() =>
              void changeMode(
                "token"
              )
            }
            style={
              tabStyle(
                mode ===
                  "token"
              )
            }
          >
            <ClipboardPaste
              size={
                14
              }
            />

            Token
          </button>

        </div>


        {
          mode === "camera"
            ? (

              <div>

                <div
                  id="security-qr-reader"
                  style={{
                    width:
                      "100%",

                    overflow:
                      "hidden",

                    borderRadius:
                      16,

                    border:
                      "1px solid var(--as-border)",

                    background:
                      "#0f172a",

                    minHeight:
                      300
                  }}
                />

                <div
                  style={{
                    display:
                      "flex",

                    gap:
                      8,

                    marginTop:
                      12
                  }}
                >

                  <Button
                    type="button"
                    onClick={() =>
                      void startScanner()
                    }
                    disabled={
                      busy
                    }
                    fullWidth
                  >
                    <Camera
                      size={
                        16
                      }
                    />

                    Start Camera
                  </Button>


                  <Button
                    type="button"
                    onClick={() =>
                      void stopScanner()
                    }
                    disabled={
                      !scanningRef.current
                    }
                    style={{
                      background:
                        "#475569"
                    }}
                    fullWidth
                  >
                    <StopCircle
                      size={
                        16
                      }
                    />

                    Stop
                  </Button>

                </div>

              </div>

            )
            : (

              <form
                onSubmit={
                  verifyManual
                }
                style={{
                  display:
                    "grid",

                  gap:
                    12
                }}
              >

                {
                  mode === "otp"
                    ? (
                      <>
                        <input
                          required
                          placeholder="Pass ID"
                          value={
                            id
                          }
                          onChange={
                            event =>
                              setId(
                                event
                                  .target
                                  .value
                              )
                          }
                          style={
                            inputStyle
                          }
                        />


                        <input
                          required
                          inputMode="numeric"
                          maxLength={
                            6
                          }
                          placeholder="6-digit OTP"
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
                          style={{
                            ...inputStyle,

                            fontFamily:
                              "monospace",

                            letterSpacing:
                              3,

                            fontSize:
                              18,

                            textAlign:
                              "center"
                          }}
                        />
                      </>
                    )
                    : (
                      <textarea
                        required
                        placeholder="Paste the QR token or decoded QR payload"
                        value={
                          token
                        }
                        onChange={
                          event =>
                            setToken(
                              event
                                .target
                                .value
                            )
                        }
                        style={{
                          ...inputStyle,

                          minHeight:
                            110,

                          resize:
                            "vertical"
                        }}
                      />
                    )
                }


                <Button
                  type="submit"
                  disabled={
                    busy
                  }
                  fullWidth
                >
                  {
                    busy
                      ? "Verifying…"
                      : "Verify & Check In"
                  }
                </Button>

              </form>

            )
        }


        {
          result && (
            <div
              className="as-fade-in"
              style={{
                marginTop:
                  16,

                padding:
                  14,

                borderRadius:
                  12,

                display:
                  "flex",

                alignItems:
                  "center",

                gap:
                  10,

                background:
                  result.ok
                    ? "rgba(22,163,74,0.1)"
                    : "rgba(220,38,38,0.1)",

                color:
                  result.ok
                    ? "#16a34a"
                    : "#dc2626",

                fontWeight:
                  700,

                fontSize:
                  13.5
              }}
            >

              {
                result.ok
                  ? (
                    <CheckCircle2
                      size={
                        18
                      }
                    />
                  )
                  : (
                    <XCircle
                      size={
                        18
                      }
                    />
                  )
              }

              {
                result.message
              }

            </div>
          )
        }

      </SectionCard>


      <p
        style={{
          fontSize:
            12,

          color:
            "var(--as-text-soft)",

          marginTop:
            12,

          textAlign:
            "center"
        }}
      >
        Camera scanning requires browser camera permission.
        On production, serve this page over HTTPS.
      </p>

    </div>
  );

}


function tabStyle(
  active:
    boolean
): React.CSSProperties {

  return {

    minHeight:
      44,

    border:
      "1px solid var(--as-border)",

    background:
      active
        ? "var(--as-primary)"
        : "var(--as-surface)",

    color:
      active
        ? "#fff"
        : "var(--as-text)",

    borderRadius:
      10,

    cursor:
      "pointer",

    fontWeight:
      800,

    fontSize:
      12,

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    gap:
      6

  };

}
