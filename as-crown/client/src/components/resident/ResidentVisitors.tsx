import { 
  useEffect,
  useState
} from "react";

import type {
  FormEvent
} from "react";

import {
  Car,
  Clock3,
  Plus,
  RefreshCw,
  UserRound,
  X
} from "lucide-react";

import {
  createResidentVisitor,
  getResidentVisitors,
  updateResidentVisitorStatus
} from "../../api/resident-visitors.api";

import type {
  ResidentVisitor
} from "../../api/resident-visitors.api";

function getErrorMessage(error: unknown, fallback: string) {
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


export default function ResidentVisitors() {

  const [
    visitors,
    setVisitors
  ] =
    useState<ResidentVisitor[]>([]);


  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    saving,
    setSaving
  ] =
    useState(false);


  const [
    showForm,
    setShowForm
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


  const [
    form,
    setForm
  ] =
    useState({

      visitorName:
        "",

      phone:
        "",

      purpose:
        "",

      vehicleNumber:
        "",

      visitorType:
        "guest",

      parkingAccess:
        false,

      parkingSlot:
        "",

      expectedAt:
        "",

      notes:
        ""

    });


  async function loadVisitors() {

    try {

      setLoading(
        true
      );

      setError("");


      const response =
        await getResidentVisitors();


      setVisitors(
        response
          ?.data
          ?.visitors ||
        []
      );

    } catch (
      requestError: unknown
    ) {

      console.error(
        requestError
      );


      setError(getErrorMessage(requestError, "Unable to load visitors."));

    } finally {

      setLoading(
        false
      );

    }

  }


  useEffect(() => {

    void loadVisitors();

  }, []);


  async function submitVisitor(
    event:
      FormEvent
  ) {

    event.preventDefault();


    try {

      setSaving(
        true
      );

      setError("");

      setSuccess("");


      await createResidentVisitor(
        form
      );


      setSuccess(
        "Visitor pre-approval created successfully."
      );


      setForm({

        visitorName:
          "",

        phone:
          "",

        purpose:
          "",

        vehicleNumber:
          "",

        visitorType:
          "guest",

        parkingAccess:
          false,

        parkingSlot:
          "",

        expectedAt:
          "",

        notes:
          ""

      });


      setShowForm(
        false
      );


      await loadVisitors();

    } catch (
      requestError: unknown
    ) {

      console.error(
        requestError
      );


      setError(getErrorMessage(requestError, "Unable to create visitor."));

    } finally {

      setSaving(
        false
      );

    }

  }


  async function changeStatus(
    id:
      number,

    status:
      "expected" |
      "inside" |
      "completed" |
      "rejected"
  ) {

    try {

      await updateResidentVisitorStatus(
        id,
        status
      );


      await loadVisitors();

    } catch (
      requestError: unknown
    ) {

      console.error(
        requestError
      );


      setError(getErrorMessage(requestError, "Unable to update visitor status."));

    }

  }


  return (

    <div
      style={
        page
      }
    >

      <div
        style={
          container
        }
      >

        <div
          style={
            header
          }
        >

          <div>

            <div
              style={
                eyebrow
              }
            >
              SECURITY
            </div>


            <h1
              style={
                title
              }
            >
              Visitors
            </h1>


            <p
              style={
                subtitle
              }
            >
              Pre-approve visitors and manage entry activity.
            </p>

          </div>


          <div
            style={
              actions
            }
          >

            <button
              type="button"

              onClick={() =>
                void loadVisitors()
              }

              style={
                secondary
              }
            >

              <RefreshCw
                size={
                  16
                }
              />

              Refresh

            </button>


            <button
              type="button"

              onClick={() =>
                setShowForm(
                  true
                )
              }

              style={
                primary
              }
            >

              <Plus
                size={
                  17
                }
              />

              New Visitor

            </button>

          </div>

        </div>


        {error && (

          <div
            style={
              errorBox
            }
          >
            {error}
          </div>

        )}


        {success && (

          <div
            style={
              successBox
            }
          >
            {success}
          </div>

        )}


        {loading ? (

          <div
            style={
              empty
            }
          >
            Loading visitors...
          </div>

        ) : visitors.length ===
          0 ? (

          <div
            style={
              empty
            }
          >

            <UserRound
              size={
                35
              }
            />

            <strong>
              No visitors yet
            </strong>

            <span>
              Create a visitor pre-approval to get started.
            </span>

          </div>

        ) : (

          <div
            style={
              list
            }
          >

            {visitors.map(
              visitor => (

                <div
                  key={
                    visitor.id
                  }

                  style={
                    card
                  }
                >

                  <div
                    style={
                      icon
                    }
                  >

                    <UserRound
                      size={
                        20
                      }
                    />

                  </div>


                  <div
                    style={
                      content
                    }
                  >

                    <div
                      style={
                        top
                      }
                    >

                      <div>

                        <strong>
                          {
                            visitor.visitor_name
                          }
                        </strong>


                        <div
                          style={
                            muted
                          }
                        >

                          {
                            visitor.visitor_type
                          }

                          {
                            visitor.purpose
                              ? ` • ${visitor.purpose}`
                              : ""
                          }

                        </div>

                      </div>


                      <span
                        style={
                          statusStyle(
                            visitor.status
                          )
                        }
                      >
                        {
                          visitor.status
                        }
                      </span>

                    </div>


                    <div
                      style={
                        details
                      }
                    >

                      {visitor.expected_at && (

                        <span>

                          <Clock3
                            size={
                              14
                            }
                          />

                          {
                            new Date(
                              visitor.expected_at
                            ).toLocaleString(
                              "en-IN"
                            )
                          }

                        </span>

                      )}


                      {visitor.vehicle_number && (

                        <span>

                          <Car
                            size={
                              14
                            }
                          />

                          {
                            visitor.vehicle_number
                          }

                        </span>

                      )}


                      {visitor.parking_access ===
                        1 && (

                        <span>

                          Parking:

                          {" "}

                          {
                            visitor.parking_slot ||
                            "Assigned"
                          }

                        </span>

                      )}

                    </div>


                    <div
                      style={
                        actionsRow
                      }
                    >

                      {visitor.status ===
                        "expected" && (

                        <>

                          <button
                            type="button"

                            onClick={() =>
                              void changeStatus(
                                visitor.id,
                                "rejected"
                              )
                            }

                            style={
                              reject
                            }
                          >
                            Reject
                          </button>


                          <button
                            type="button"

                            onClick={() =>
                              void changeStatus(
                                visitor.id,
                                "inside"
                              )
                            }

                            style={
                              approve
                            }
                          >
                            Approve / Check In
                          </button>

                        </>

                      )}


                      {visitor.status ===
                        "inside" && (

                        <button
                          type="button"

                          onClick={() =>
                            void changeStatus(
                              visitor.id,
                              "completed"
                            )
                          }

                          style={
                            approve
                          }
                        >
                          Mark Checked Out
                        </button>

                      )}

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}


        {showForm && (

          <div
            style={
              overlay
            }
          >

            <form
              onSubmit={
                submitVisitor
              }

              style={
                modal
              }
            >

              <div
                style={
                  modalHeader
                }
              >

                <div>

                  <div
                    style={
                      eyebrow
                    }
                  >
                    VISITOR PASS
                  </div>


                  <h2
                    style={
                      modalTitle
                    }
                  >
                    New Visitor
                  </h2>

                </div>


                <button
                  type="button"

                  onClick={() =>
                    setShowForm(
                      false
                    )
                  }

                  style={
                    closeButton
                  }
                >

                  <X
                    size={
                      18
                    }
                  />

                </button>

              </div>


              <Field
                label="Visitor Name"
                value={
                  form.visitorName
                }

                onChange={
                  value =>
                    setForm(
                      current => ({
                        ...current,
                        visitorName:
                          value
                      })
                    )
                }

                required
              />


              <Field
                label="Phone"
                value={
                  form.phone
                }

                onChange={
                  value =>
                    setForm(
                      current => ({
                        ...current,
                        phone:
                          value
                      })
                    )
                }
              />


              <div
                style={
                  twoColumns
                }
              >

                <Field
                  label="Purpose"
                  value={
                    form.purpose
                  }

                  onChange={
                    value =>
                      setForm(
                        current => ({
                          ...current,
                          purpose:
                            value
                        })
                      )
                  }
                />


                <label
                  style={
                    label
                  }
                >

                  Visitor Type

                  <select
                    value={
                      form.visitorType
                    }

                    onChange={
                      event =>
                        setForm(
                          current => ({
                            ...current,
                            visitorType:
                              event.target.value
                          })
                        )
                    }

                    style={
                      input
                    }
                  >

                    <option value="guest">
                      Guest
                    </option>

                    <option value="delivery">
                      Delivery
                    </option>

                    <option value="service">
                      Service
                    </option>

                    <option value="cab">
                      Cab
                    </option>

                    <option value="other">
                      Other
                    </option>

                  </select>

                </label>

              </div>


              <Field
                label="Expected Arrival"
                type="datetime-local"
                value={
                  form.expectedAt
                }

                onChange={
                  value =>
                    setForm(
                      current => ({
                        ...current,
                        expectedAt:
                          value
                      })
                    )
                }
              />


              <Field
                label="Vehicle Number"
                value={
                  form.vehicleNumber
                }

                onChange={
                  value =>
                    setForm(
                      current => ({
                        ...current,
                        vehicleNumber:
                          value
                      })
                    )
                }
              />


              <label
                style={
                  checkboxRow
                }
              >

                <input
                  type="checkbox"

                  checked={
                    form.parkingAccess
                  }

                  onChange={
                    event =>
                      setForm(
                        current => ({
                          ...current,
                          parkingAccess:
                            event.target.checked
                        })
                      )
                  }
                />

                <span>
                  Visitor requires parking
                </span>

              </label>


              {form.parkingAccess && (

                <Field
                  label="Parking Slot"
                  value={
                    form.parkingSlot
                  }

                  onChange={
                    value =>
                      setForm(
                        current => ({
                          ...current,
                          parkingSlot:
                            value
                        })
                      )
                  }

                  required
                />

              )}


              <label
                style={
                  label
                }
              >

                Notes

                <textarea
                  value={
                    form.notes
                  }

                  onChange={
                    event =>
                      setForm(
                        current => ({
                          ...current,
                          notes:
                            event.target.value
                        })
                      )
                  }

                  rows={
                    3
                  }

                  style={
                    textarea
                  }
                />

              </label>


              <div
                style={
                  modalFooter
                }
              >

                <button
                  type="button"

                  onClick={() =>
                    setShowForm(
                      false
                    )
                  }

                  style={
                    secondary
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"

                  disabled={
                    saving
                  }

                  style={
                    primary
                  }
                >

                  {
                    saving
                      ? "Creating..."
                      : "Create Visitor Pass"
                  }

                </button>

              </div>

            </form>

          </div>

        )}

      </div>

    </div>

  );

}


function Field({
  label: fieldLabel,
  value,
  onChange,
  required =
    false,
  type =
    "text"
}: {
  label:
    string;

  value:
    string;

  onChange:
    (
      value:
        string
    ) => void;

  required?:
    boolean;

  type?:
    string;
}) {

  return (

    <label
      style={
        label
      }
    >

      {
        fieldLabel
      }


      <input
        type={
          type
        }

        value={
          value
        }

        required={
          required
        }

        onChange={
          event =>
            onChange(
              event.target.value
            )
        }

        style={
          input
        }
      />

    </label>

  );

}


function statusStyle(
  status:
    string
): React.CSSProperties {

  return {

    padding:
      "5px 9px",

    borderRadius:
      999,

    background:
      status ===
      "expected"

        ? "#eff6ff"

        : status ===
          "inside"

          ? "#ecfdf5"

          : status ===
            "rejected"

            ? "#fef2f2"

            : "#f1f5f9",

    color:
      status ===
      "expected"

        ? "#2563eb"

        : status ===
          "inside"

          ? "#047857"

          : status ===
            "rejected"

            ? "#b91c1c"

            : "#64748b",

    fontSize:
      10,

    fontWeight:
      800,

    textTransform:
      "uppercase"

  };

}


const page: React.CSSProperties = {
  minHeight:
    "100vh",
  background:
    "#f8fafc",
  padding:
    28
};


const container: React.CSSProperties = {
  maxWidth:
    1150,
  margin:
    "0 auto"
};


const header: React.CSSProperties = {
  display:
    "flex",
  justifyContent:
    "space-between",
  alignItems:
    "flex-end",
  gap:
    15,
  flexWrap:
    "wrap",
  marginBottom:
    20
};


const eyebrow: React.CSSProperties = {
  fontSize:
    11,
  fontWeight:
    800,
  letterSpacing:
    1.5,
  color:
    "#2563eb"
};


const title: React.CSSProperties = {
  margin:
    "5px 0",
  fontSize:
    30
};


const subtitle: React.CSSProperties = {
  margin:
    0,
  color:
    "#64748b"
};


const actions: React.CSSProperties = {
  display:
    "flex",
  gap:
    8
};


const primary: React.CSSProperties = {
  height:
    42,
  padding:
    "0 14px",
  border:
    0,
  borderRadius:
    9,
  background:
    "#2563eb",
  color:
    "white",
  display:
    "inline-flex",
  alignItems:
    "center",
  justifyContent:
    "center",
  gap:
    7,
  cursor:
    "pointer",
  fontWeight:
    700
};


const secondary: React.CSSProperties = {
  height:
    42,
  padding:
    "0 14px",
  border:
    "1px solid #e2e8f0",
  borderRadius:
    9,
  background:
    "white",
  color:
    "#334155",
  display:
    "inline-flex",
  alignItems:
    "center",
  justifyContent:
    "center",
  gap:
    7,
  cursor:
    "pointer",
  fontWeight:
    700
};


const errorBox: React.CSSProperties = {
  background:
    "#fef2f2",
  color:
    "#b91c1c",
  border:
    "1px solid #fecaca",
  padding:
    12,
  borderRadius:
    10,
  marginBottom:
    14
};


const successBox: React.CSSProperties = {
  background:
    "#ecfdf5",
  color:
    "#047857",
  border:
    "1px solid #a7f3d0",
  padding:
    12,
  borderRadius:
    10,
  marginBottom:
    14
};


const list: React.CSSProperties = {
  display:
    "grid",
  gap:
    12
};


const card: React.CSSProperties = {
  background:
    "white",
  border:
    "1px solid #e2e8f0",
  borderRadius:
    15,
  padding:
    18,
  display:
    "flex",
  gap:
    13
};


const icon: React.CSSProperties = {
  width:
    44,
  height:
    44,
  borderRadius:
    11,
  background:
    "#eff6ff",
  color:
    "#2563eb",
  display:
    "grid",
  placeItems:
    "center",
  flexShrink:
    0
};


const content: React.CSSProperties = {
  flex:
    1,
  minWidth:
    0
};


const top: React.CSSProperties = {
  display:
    "flex",
  justifyContent:
    "space-between",
  alignItems:
    "flex-start",
  gap:
    10
};


const muted: React.CSSProperties = {
  color:
    "#64748b",
  fontSize:
    12,
  marginTop:
    3
};


const details: React.CSSProperties = {
  display:
    "flex",
  gap:
    13,
  flexWrap:
    "wrap",
  marginTop:
    13,
  color:
    "#64748b",
  fontSize:
    12
};


const actionsRow: React.CSSProperties = {
  display:
    "flex",
  justifyContent:
    "flex-end",
  gap:
    8,
  flexWrap:
    "wrap",
  marginTop:
    14
};


const approve: React.CSSProperties = {
  border:
    0,
  borderRadius:
    8,
  background:
    "#2563eb",
  color:
    "white",
  padding:
    "8px 11px",
  cursor:
    "pointer",
  fontWeight:
    700
};


const reject: React.CSSProperties = {
  border:
    "1px solid #fecaca",
  borderRadius:
    8,
  background:
    "#fef2f2",
  color:
    "#b91c1c",
  padding:
    "8px 11px",
  cursor:
    "pointer",
  fontWeight:
    700
};


const empty: React.CSSProperties = {
  minHeight:
    260,
  background:
    "white",
  border:
    "1px solid #e2e8f0",
  borderRadius:
    16,
  display:
    "grid",
  placeItems:
    "center",
  textAlign:
    "center",
  color:
    "#94a3b8",
  gap:
    7
};


const overlay: React.CSSProperties = {
  position:
    "fixed",
  inset:
    0,
  background:
    "rgba(15,23,42,.55)",
  zIndex:
    3000,
  display:
    "grid",
  placeItems:
    "center",
  padding:
    20
};


const modal: React.CSSProperties = {
  width:
    "100%",
  maxWidth:
    620,
  maxHeight:
    "calc(100vh - 40px)",
  overflowY:
    "auto",
  background:
    "white",
  borderRadius:
    18,
  padding:
    24,
  boxSizing:
    "border-box"
};


const modalHeader: React.CSSProperties = {
  display:
    "flex",
  justifyContent:
    "space-between",
  alignItems:
    "center",
  marginBottom:
    18
};


const modalTitle: React.CSSProperties = {
  margin:
    "4px 0 0",
  fontSize:
    21
};


const closeButton: React.CSSProperties = {
  width:
    36,
  height:
    36,
  border:
    0,
  borderRadius:
    8,
  background:
    "#f1f5f9",
  display:
    "grid",
  placeItems:
    "center",
  cursor:
    "pointer"
};


const label: React.CSSProperties = {
  display:
    "block",
  fontSize:
    13,
  fontWeight:
    700,
  color:
    "#334155",
  marginBottom:
    14
};


const input: React.CSSProperties = {
  width:
    "100%",
  height:
    43,
  marginTop:
    6,
  boxSizing:
    "border-box",
  border:
    "1px solid #e2e8f0",
  borderRadius:
    9,
  padding:
    "0 12px",
  background:
    "white"
};


const textarea: React.CSSProperties = {
  ...input,
  height:
    "auto",
  padding:
    12,
  resize:
    "vertical"
};


const twoColumns: React.CSSProperties = {
  display:
    "grid",
  gridTemplateColumns:
    "repeat(2,minmax(0,1fr))",
  gap:
    12
};


const checkboxRow: React.CSSProperties = {
  display:
    "flex",
  alignItems:
    "center",
  gap:
    8,
  marginBottom:
    14,
  fontSize:
    13
};


const modalFooter: React.CSSProperties = {
  borderTop:
    "1px solid #f1f5f9",
  marginTop:
    6,
  paddingTop:
    16,
  display:
    "flex",
  justifyContent:
    "flex-end",
  gap:
    8
};