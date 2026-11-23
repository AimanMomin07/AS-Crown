import {
  useCallback,
  useEffect,
  useState
} from "react";

import type {
  CSSProperties,
  ChangeEvent,
  FormEvent
} from "react";

import {
  Plus,
  RefreshCw,
  X,
  Save,
  Search
} from "lucide-react";

import {
  getVisitors,
  createVisitor,
  updateVisitorStatus
} from "../../api/visitors.api";

import {
  getAdminUsers
} from "../../api/admin.api";

import {
  getFlats
} from "../../api/flats.api";


/* =========================================================
   TYPES
========================================================= */

type VisitorStatus =
  | "expected"
  | "inside"
  | "completed"
  | "rejected";


type VisitorType =
  | "guest"
  | "delivery"
  | "service"
  | "cab"
  | "other";


interface Visitor {

  id: number;

  visitor_name: string;

  phone?: string | null;

  flat_id?: number | null;

  resident_id?: number | null;

  flat_number?: string | null;

  flat_type?: string | null;

  building_name?: string | null;

  building_code?: string | null;

  resident_first_name?: string | null;

  resident_last_name?: string | null;

  purpose?: string | null;

  vehicle_number?: string | null;

  parking_access?: number | boolean | null;

  parking_slot?: string | null;

  visitor_type: VisitorType;

  status: VisitorStatus;

  check_in?: string | null;

  check_out?: string | null;

  notes?: string | null;

  created_at?: string | null;

}

interface Resident {

  id: number;

  first_name: string;

  last_name?: string | null;

}


interface Flat {

  id: number;

  flat_number: string;

  building_name?: string | null;

}


interface VisitorForm {

  visitorName: string;

  phone: string;

  flatId: string;

  residentId: string;

  purpose: string;

  vehicleNumber: string;

  visitorType: VisitorType;

  parkingAccess: boolean;

  parkingSlot: string;

  notes: string;

}


/* =========================================================
   INITIAL FORM
========================================================= */

function getInitialForm(): VisitorForm {

  return {

    visitorName: "",

    phone: "",

    flatId: "",

    residentId: "",

    purpose: "",

    vehicleNumber: "",

    visitorType: "guest",

    parkingAccess: false,

    parkingSlot: "",

    notes: ""

  };

}


/* =========================================================
   COMPONENT
========================================================= */

export default function AdminVisitors() {

  /* -------------------------------------------------------
     DATA
  ------------------------------------------------------- */

  const [
    visitors,
    setVisitors
  ] =
    useState<Visitor[]>([]);


  const [
    residents,
    setResidents
  ] =
    useState<Resident[]>([]);


  const [
    flats,
    setFlats
  ] =
    useState<Flat[]>([]);


  /* -------------------------------------------------------
     UI STATE
  ------------------------------------------------------- */

  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    formLoading,
    setFormLoading
  ] =
    useState(true);


  const [
    saving,
    setSaving
  ] =
    useState(false);


  const [
    showModal,
    setShowModal
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
    search,
    setSearch
  ] =
    useState("");


  const [
    updatingStatusId,
    setUpdatingStatusId
  ] =
    useState<number | null>(
      null
    );


  /* -------------------------------------------------------
     FORM
  ------------------------------------------------------- */

  const [
    form,
    setForm
  ] =
    useState<VisitorForm>(
      getInitialForm()
    );


  /* =========================================================
     LOAD VISITORS
  ========================================================= */

  const loadVisitors =
    useCallback(
      async () => {

        try {

          setLoading(true);

          setError("");


          const response =
            await getVisitors({

              search:
                search.trim() ||
                undefined

            });


          setVisitors(
            response?.data?.visitors ||
            []
          );

        } catch (
          requestError: any
        ) {

          console.error(
            "Load visitors error:",
            requestError
          );


          setError(
            requestError
              ?.response
              ?.data
              ?.message ||
            "Unable to load visitors."
          );

        } finally {

          setLoading(false);

        }

      },
      [
        search
      ]
    );


  /* =========================================================
     LOAD RESIDENTS + FLATS
  ========================================================= */

  const loadFormData =
    useCallback(
      async () => {

        try {

          setFormLoading(true);


          const [
            residentsResponse,
            flatsResponse
          ] =
            await Promise.all([

              getAdminUsers({

                role:
                  "resident",

                status:
                  "active",

                limit:
                  200

              }),

              getFlats({

                status:
                  "active"

              })

            ]);


          setResidents(
            residentsResponse
              ?.data
              ?.users ||
            []
          );


          setFlats(
            flatsResponse
              ?.data
              ?.flats ||
            []
          );

        } catch (
          requestError: any
        ) {

          console.error(
            "Load visitor form data error:",
            requestError
          );


          setError(
            requestError
              ?.response
              ?.data
              ?.message ||
            "Unable to load residents and flats."
          );

        } finally {

          setFormLoading(false);

        }

      },
      []
    );


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {

    void loadVisitors();

  }, [
    loadVisitors
  ]);


  useEffect(() => {

    void loadFormData();

  }, [
    loadFormData
  ]);


  /* =========================================================
     FILTER CLIENT-SIDE TOO
  ========================================================= */

  const filteredVisitors =
    visitors.filter(
      visitor => {

        const value =
          search
            .trim()
            .toLowerCase();


        if (!value) {

          return true;

        }


        return (

          visitor.visitor_name
            .toLowerCase()
            .includes(value)

          ||

          (
            visitor.phone ||
            ""
          )
            .toLowerCase()
            .includes(value)

          ||

          (
            visitor.vehicle_number ||
            ""
          )
            .toLowerCase()
            .includes(value)

          ||

          (
            visitor.flat_number ||
            ""
          )
            .toLowerCase()
            .includes(value)

          ||

          (
            visitor.building_name ||
            ""
          )
            .toLowerCase()
            .includes(value)

        );

      }
    );


  /* =========================================================
     OPEN MODAL
  ========================================================= */

  function openCreate() {

    setError("");

    setSuccess("");

    setForm(
      getInitialForm()
    );

    setShowModal(true);

  }


  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  function closeCreate() {

    if (
      saving
    ) {

      return;

    }


    setShowModal(false);

  }


  /* =========================================================
     HANDLE FORM CHANGE
  ========================================================= */

  function updateForm(
    patch: Partial<VisitorForm>
  ) {

    setForm(
      current => ({
        ...current,
        ...patch
      })
    );

  }


  /* =========================================================
     CREATE VISITOR
  ========================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError("");

    setSuccess("");


    const visitorName =
      form.visitorName
        .trim();


    const vehicleNumber =
      form.vehicleNumber
        .trim()
        .toUpperCase();


    const parkingSlot =
      form.parkingSlot
        .trim();


    if (!visitorName) {

      setError(
        "Visitor name is required."
      );

      return;

    }


    if (
      form.parkingAccess &&
      !vehicleNumber
    ) {

      setError(
        "Vehicle number is required when parking access is enabled."
      );

      return;

    }


    if (
      form.parkingAccess &&
      !parkingSlot
    ) {

      setError(
        "Parking slot is required when parking access is enabled."
      );

      return;

    }


    if (
      form.flatId &&
      !Number.isInteger(
        Number(
          form.flatId
        )
      )
    ) {

      setError(
        "Please select a valid flat."
      );

      return;

    }


    if (
      form.residentId &&
      !Number.isInteger(
        Number(
          form.residentId
        )
      )
    ) {

      setError(
        "Please select a valid resident."
      );

      return;

    }


    try {

      setSaving(true);


      await createVisitor({

        visitorName,

        phone:
          form.phone.trim() ||
          null,

        flatId:
          form.flatId
            ? Number(
                form.flatId
              )
            : null,

        residentId:
          form.residentId
            ? Number(
                form.residentId
              )
            : null,

        purpose:
          form.purpose.trim() ||
          null,

        vehicleNumber:
          vehicleNumber ||
          null,

        visitorType:
          form.visitorType,

        parkingAccess:
          form.parkingAccess
            ? 1
            : 0,

        parkingSlot:
          form.parkingAccess
            ? parkingSlot
            : null,

        notes:
          form.notes.trim() ||
          null

      });


      setShowModal(
        false
      );


      setForm(
        getInitialForm()
      );


      setSuccess(
        "Visitor created successfully."
      );


      await loadVisitors();

    } catch (
      requestError: any
    ) {

      console.error(
        "Create visitor error:",
        requestError
      );


      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
        "Unable to create visitor."
      );

    } finally {

      setSaving(false);

    }

  }


  /* =========================================================
     UPDATE STATUS
  ========================================================= */

  async function changeStatus(
    id: number,
    status: VisitorStatus
  ) {

    try {

      setUpdatingStatusId(
        id
      );

      setError("");

      setSuccess("");


      await updateVisitorStatus(
        id,
        status
      );


      setSuccess(
        "Visitor status updated successfully."
      );


      await loadVisitors();

    } catch (
      requestError: any
    ) {

      console.error(
        "Update visitor status error:",
        requestError
      );


      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
        "Unable to update visitor status."
      );

    } finally {

      setUpdatingStatusId(
        null
      );

    }

  }


  /* =========================================================
     STATUS HANDLER
  ========================================================= */

  function handleStatusChange(
    event:
      ChangeEvent<HTMLSelectElement>,
    visitorId: number
  ) {

    const value =
      event.target.value;


    if (
      value ===
        "expected" ||
      value ===
        "inside" ||
      value ===
        "completed" ||
      value ===
        "rejected"
    ) {

      void changeStatus(
        visitorId,
        value
      );

    }

  }


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div
      style={{
        minHeight:
          "100vh",

        background:
          "#f8fafc",

        padding:
          28,

        boxSizing:
          "border-box"
      }}
    >

      <div
        style={{
          maxWidth:
            1450,

          margin:
            "0 auto"
        }}
      >

        {/* ===================================================
            HEADER
        =================================================== */}

        <div
          style={{
            display:
              "flex",

            justifyContent:
              "space-between",

            alignItems:
              "center",

            gap:
              15,

            flexWrap:
              "wrap",

            marginBottom:
              20
          }}
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
                description
              }
            >
              Manage guests, vehicles, parking access and visitor history.
            </p>

          </div>


          <div
            style={{
              display:
                "flex",

              gap:
                8
            }}
          >

            <button
              type="button"

              onClick={() => {

                void loadVisitors();

                void loadFormData();

              }}

              style={
                secondary
              }
            >

              <RefreshCw
                size={16}
              />

              Refresh

            </button>


            <button
              type="button"

              onClick={
                openCreate
              }

              style={
                primary
              }
            >

              <Plus
                size={17}
              />

              New Visitor

            </button>

          </div>

        </div>


        {/* ===================================================
            ALERTS
        =================================================== */}

        {error && (

          <Message
            type="error"
            text={
              error
            }
          />

        )}


        {success && (

          <Message
            type="success"
            text={
              success
            }
          />

        )}


        {/* ===================================================
            SEARCH
        =================================================== */}

        <div
          style={{
            background:
              "white",

            border:
              "1px solid #e2e8f0",

            borderRadius:
              14,

            padding:
              14,

            marginBottom:
              15
          }}
        >

          <div
            style={{
              position:
                "relative"
            }}
          >

            <Search
              size={17}

              style={{
                position:
                  "absolute",

                left:
                  13,

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
                search
              }

              onChange={
                event =>
                  setSearch(
                    event.target.value
                  )
              }

              placeholder=
                "Search visitor, phone, flat or vehicle"

              style={{
                ...searchInput,

                paddingLeft:
                  40
              }}
            />

          </div>

        </div>


        {/* ===================================================
            TABLE
        =================================================== */}

        <div
          style={
            tableWrapper
          }
        >

          <div
            style={{
              overflowX:
                "auto"
            }}
          >

            <table
              style={
                table
              }
            >

              <thead>

                <tr>

                  <th
                    style={
                      th
                    }
                  >
                    Visitor
                  </th>


                  <th
                    style={
                      th
                    }
                  >
                    Resident / Flat
                  </th>


                  <th
                    style={
                      th
                    }
                  >
                    Vehicle
                  </th>


                  <th
                    style={
                      th
                    }
                  >
                    Parking
                  </th>


                  <th
                    style={
                      th
                    }
                  >
                    Type
                  </th>


                  <th
                    style={
                      th
                    }
                  >
                    Status
                  </th>


                  <th
                    style={
                      th
                    }
                  >
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan={
                        7
                      }

                      style={
                        empty
                      }
                    >
                      Loading visitors...
                    </td>

                  </tr>

                ) : filteredVisitors.length === 0 ? (

                  <tr>

                    <td
                      colSpan={
                        7
                      }

                      style={
                        empty
                      }
                    >
                      No visitors found.
                    </td>

                  </tr>

                ) : (

                  filteredVisitors.map(
                    visitor => (

                      <tr
                        key={
                          visitor.id
                        }

                        style={
                          tr
                        }
                      >

                        {/* VISITOR */}

                        <td
                          style={
                            td
                          }
                        >

                          <strong>
                            {
                              visitor.visitor_name
                            }
                          </strong>


                          <div
                            style={
                              small
                            }
                          >
                            {
                              visitor.phone ||
                              "No phone"
                            }
                          </div>


                          {visitor.purpose && (

                            <div
                              style={
                                tiny
                              }
                            >
                              {
                                visitor.purpose
                              }
                            </div>

                          )}

                        </td>


                        {/* RESIDENT / FLAT */}

                        <td
                          style={
                            td
                          }
                        >

                          <strong>

                            {
                              visitor.flat_number ||
                              "No flat"
                            }

                          </strong>


                          <div
                            style={
                              small
                            }
                          >

                            {
                              visitor.building_name ||
                              "—"
                            }

                          </div>


                          <div
                            style={
                              tiny
                            }
                          >

                            {
                              visitor.resident_id
                                ? `${visitor.resident_first_name || ""} ${visitor.resident_last_name || ""}`.trim()
                                : "No resident linked"
                            }

                          </div>

                        </td>


                        {/* VEHICLE */}

                        <td
                          style={
                            td
                          }
                        >

                          {
                            visitor.vehicle_number ||
                            "No vehicle"
                          }

                        </td>


                        {/* PARKING */}

                        <td
                          style={
                            td
                          }
                        >

                          {
                            visitor.parking_access
                              ? visitor.parking_slot ||
                                "Enabled"
                              : "No parking"
                          }

                        </td>


                        {/* TYPE */}

                        <td
                          style={
                            td
                          }
                        >

                          <span
                            style={
                              typeBadge
                            }
                          >
                            {
                              visitor.visitor_type
                            }
                          </span>

                        </td>


                        {/* STATUS */}

                        <td
                          style={
                            td
                          }
                        >

                          <span
                            style={
                              getStatusBadge(
                                visitor.status
                              )
                            }
                          >
                            {
                              visitor.status
                            }
                          </span>

                        </td>


                        {/* ACTION */}

                        <td
                          style={
                            td
                          }
                        >

                          <select

                            value={
                              visitor.status
                            }

                            disabled={
                              updatingStatusId ===
                              visitor.id
                            }

                            onChange={
                              event =>
                                handleStatusChange(
                                  event,
                                  visitor.id
                                )
                            }

                            style={{
                              ...statusSelect,

                              opacity:
                                updatingStatusId ===
                                visitor.id
                                  ? 0.6
                                  : 1
                            }}
                          >

                            <option
                              value="expected"
                            >
                              Expected
                            </option>

                            <option
                              value="inside"
                            >
                              Check In
                            </option>

                            <option
                              value="completed"
                            >
                              Check Out
                            </option>

                            <option
                              value="rejected"
                            >
                              Reject
                            </option>

                          </select>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>


      {/* =====================================================
          NEW VISITOR MODAL
      ===================================================== */}

      {showModal && (

        <div
          style={
            overlay
          }
        >

          <form
            onSubmit={
              handleSubmit
            }

            style={
              modal
            }
          >

            {/* HEADER */}

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
                  SECURITY ENTRY
                </div>


                <h2
                  style={
                    modalTitle
                  }
                >
                  New Visitor
                </h2>


                <p
                  style={
                    modalDescription
                  }
                >
                  Create a visitor record with optional vehicle and parking access.
                </p>

              </div>


              <button
                type="button"

                onClick={
                  closeCreate
                }

                style={
                  closeButton
                }
              >

                <X
                  size={18}
                />

              </button>

            </div>


            {/* FORM */}

            <Field
              label="Visitor Name"
              value={
                form.visitorName
              }

              onChange={
                value =>
                  updateForm({
                    visitorName:
                      value
                  })
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
                  updateForm({
                    phone:
                      value
                  })
              }
            />


            <div
              style={
                twoColumns
              }
            >

              <SelectField
                label="Resident"
                value={
                  form.residentId
                }

                onChange={
                  value =>
                    updateForm({
                      residentId:
                        value
                    })
                }

                options={
                  residents.map(
                    resident => ({
                      value:
                        String(
                          resident.id
                        ),

                      label:
                        `${resident.first_name} ${resident.last_name || ""}`.trim()
                    })
                  )
                }

                placeholder=
                  "Select resident"
              />


              <SelectField
                label="Flat"
                value={
                  form.flatId
                }

                onChange={
                  value =>
                    updateForm({
                      flatId:
                        value
                    })
                }

                options={
                  flats.map(
                    flat => ({
                      value:
                        String(
                          flat.id
                        ),

                      label:
                        `${flat.building_name || "Building"} • ${flat.flat_number}`
                    })
                  )
                }

                placeholder=
                  "Select flat"
              />

            </div>


            <Field
              label="Purpose"
              value={
                form.purpose
              }

              onChange={
                value =>
                  updateForm({
                    purpose:
                      value
                  })
              }
            />


            <SelectField
              label="Visitor Type"
              value={
                form.visitorType
              }

              onChange={
                value => {

                  if (
                    value ===
                      "guest" ||
                    value ===
                      "delivery" ||
                    value ===
                      "service" ||
                    value ===
                      "cab" ||
                    value ===
                      "other"
                  ) {

                    updateForm({
                      visitorType:
                        value
                    });

                  }

                }
              }

              options={[
                {
                  value:
                    "guest",

                  label:
                    "Guest"
                },

                {
                  value:
                    "delivery",

                  label:
                    "Delivery"
                },

                {
                  value:
                    "service",

                  label:
                    "Service"
                },

                {
                  value:
                    "cab",

                  label:
                    "Cab"
                },

                {
                  value:
                    "other",

                  label:
                    "Other"
                }
              ]}

            />


            {/* VEHICLE / PARKING */}

            <div
              style={
                parkingCard
              }
            >

              <div
                style={
                  parkingHeader
                }
              >

                <div>

                  <strong>
                    Vehicle & Parking
                  </strong>

                  <div
                    style={
                      small
                    }
                  >
                    Parking is optional.
                  </div>

                </div>


                <label
                  style={
                    checkboxLabel
                  }
                >

                  <input
                    type="checkbox"

                    checked={
                      form.parkingAccess
                    }

                    onChange={
                      event =>
                        updateForm({

                          parkingAccess:
                            event.target.checked,

                          parkingSlot:
                            event.target.checked
                              ? form.parkingSlot
                              : ""

                        })
                    }
                  />

                  Parking access

                </label>

              </div>


              <Field
                label="Vehicle Number"
                value={
                  form.vehicleNumber
                }

                onChange={
                  value =>
                    updateForm({
                      vehicleNumber:
                        value
                    })
                }
              />


              {form.parkingAccess && (

                <Field
                  label="Visitor Parking Slot"
                  value={
                    form.parkingSlot
                  }

                  onChange={
                    value =>
                      updateForm({
                        parkingSlot:
                          value
                      })
                  }

                  required
                />

              )}

            </div>


            <label
              style={
                fieldLabel
              }
            >

              Notes

              <textarea

                rows={
                  4
                }

                value={
                  form.notes
                }

                onChange={
                  event =>
                    updateForm({
                      notes:
                        event.target.value
                    })
                }

                style={
                  textarea
                }

                placeholder=
                  "Additional information..."

              />

            </label>


            {/* FOOTER */}

            <div
              style={
                modalFooter
              }
            >

              <button
                type="button"

                onClick={
                  closeCreate
                }

                disabled={
                  saving
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
                  saving ||
                  formLoading
                }

                style={{
                  ...primary,

                  opacity:
                    saving ||
                    formLoading
                      ? 0.7
                      : 1
                }}
              >

                <Save
                  size={16}
                />

                {
                  saving
                    ? "Creating..."
                    : formLoading
                      ? "Loading..."
                      : "Create Visitor"
                }

              </button>

            </div>

          </form>

        </div>

      )}

    </div>

  );

}


/* =========================================================
   TEXT FIELD
========================================================= */

function Field({
  label,
  value,
  onChange,
  required = false
}: {
  label:
    string;

  value:
    string;

  onChange:
    (
      value: string
    ) => void;

  required?:
    boolean;
}) {

  return (

    <label
      style={
        fieldLabel
      }
    >

      {label}


      <input
        value={
          value
        }

        onChange={
          event =>
            onChange(
              event.target.value
            )
        }

        required={
          required
        }

        style={
          input
        }
      />

    </label>

  );

}


/* =========================================================
   SELECT FIELD
========================================================= */

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder
}: {
  label:
    string;

  value:
    string;

  onChange:
    (
      value: string
    ) => void;

  options:
    {
      value:
        string;

      label:
        string;
    }[];

  placeholder?:
    string;
}) {

  return (

    <label
      style={
        fieldLabel
      }
    >

      {label}


      <select
        value={
          value
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
      >

        {placeholder && (

          <option
            value=""
          >
            {
              placeholder
            }
          </option>

        )}


        {options.map(
          option => (

            <option
              key={
                option.value
              }

              value={
                option.value
              }
            >
              {
                option.label
              }
            </option>

          )
        )}

      </select>

    </label>

  );

}


/* =========================================================
   MESSAGE
========================================================= */

function Message({
  type,
  text
}: {
  type:
    "error" |
    "success";

  text:
    string;
}) {

  return (

    <div
      style={{
        marginBottom:
          15,

        padding:
          "12px 15px",

        borderRadius:
          10,

        background:
          type === "error"
            ? "#fef2f2"
            : "#ecfdf5",

        color:
          type === "error"
            ? "#b91c1c"
            : "#047857",

        border:
          `1px solid ${
            type === "error"
              ? "#fecaca"
              : "#a7f3d0"
          }`
      }}
    >

      {text}

    </div>

  );

}


/* =========================================================
   STATUS BADGE
========================================================= */

function getStatusBadge(
  status: VisitorStatus
): CSSProperties {

  switch (
    status
  ) {

    case "inside":

      return {
        ...badgeBase,

        background:
          "#ecfdf5",

        color:
          "#047857"
      };


    case "completed":

      return {
        ...badgeBase,

        background:
          "#f1f5f9",

        color:
          "#475569"
      };


    case "rejected":

      return {
        ...badgeBase,

        background:
          "#fef2f2",

        color:
          "#b91c1c"
      };


    default:

      return {
        ...badgeBase,

        background:
          "#fff7ed",

        color:
          "#b45309"
      };

  }

}


/* =========================================================
   STYLES
========================================================= */

const eyebrow:
  CSSProperties = {

    fontSize:
      11,

    fontWeight:
      800,

    letterSpacing:
      1.5,

    color:
      "#2563eb"

  };


const title:
  CSSProperties = {

    margin:
      "5px 0",

    fontSize:
      30

  };


const description:
  CSSProperties = {

    margin:
      0,

    color:
      "#64748b"

  };


const modalTitle:
  CSSProperties = {

    margin:
      "4px 0",

    fontSize:
      22,

    color:
      "#0f172a"

  };


const modalDescription:
  CSSProperties = {

    margin:
      "4px 0 0",

    color:
      "#64748b",

    fontSize:
      13

  };


const primary:
  CSSProperties = {

    height:
      42,

    padding:
      "0 15px",

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


const secondary:
  CSSProperties = {

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
      "pointer"

  };


const searchInput:
  CSSProperties = {

    width:
      "100%",

    height:
      44,

    boxSizing:
      "border-box",

    border:
      0,

    outline:
      "none",

    fontSize:
      14,

    background:
      "white"

  };


const tableWrapper:
  CSSProperties = {

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      16,

    overflow:
      "hidden"

  };


const table:
  CSSProperties = {

    width:
      "100%",

    borderCollapse:
      "collapse"

  };


const th:
  CSSProperties = {

    textAlign:
      "left",

    padding:
      "13px 16px",

    fontSize:
      11,

    color:
      "#64748b",

    textTransform:
      "uppercase",

    whiteSpace:
      "nowrap"

  };


const td:
  CSSProperties = {

    padding:
      "14px 16px",

    fontSize:
      13,

    color:
      "#334155",

    verticalAlign:
      "top"

  };


const tr:
  CSSProperties = {

    borderTop:
      "1px solid #f1f5f9"

  };


const small:
  CSSProperties = {

    fontSize:
      11,

    color:
      "#94a3b8",

    marginTop:
      3

  };


const tiny:
  CSSProperties = {

    fontSize:
      10,

    color:
      "#94a3b8",

    marginTop:
      3

  };


const typeBadge:
  CSSProperties = {

    display:
      "inline-flex",

    padding:
      "5px 9px",

    borderRadius:
      999,

    background:
      "#eff6ff",

    color:
      "#1d4ed8",

    fontSize:
      11,

    fontWeight:
      700

  };


const badgeBase:
  CSSProperties = {

    display:
      "inline-flex",

    padding:
      "5px 9px",

    borderRadius:
      999,

    fontSize:
      11,

    fontWeight:
      700

  };


const statusSelect:
  CSSProperties = {

    height:
      34,

    border:
      "1px solid #e2e8f0",

    borderRadius:
      8,

    padding:
      "0 8px",

    background:
      "white",

    cursor:
      "pointer",

    fontSize:
      12

  };


const empty:
  CSSProperties = {

    padding:
      50,

    textAlign:
      "center",

    color:
      "#94a3b8"

  };


const fieldLabel:
  CSSProperties = {

    display:
      "block",

    marginBottom:
      14,

    fontSize:
      13,

    fontWeight:
      700,

    color:
      "#334155"

  };


const input:
  CSSProperties = {

    width:
      "100%",

    height:
      44,

    boxSizing:
      "border-box",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      9,

    padding:
      "0 12px",

    background:
      "white",

    outline:
      "none",

    marginTop:
      6

  };


const textarea:
  CSSProperties = {

    width:
      "100%",

    minHeight:
      100,

    boxSizing:
      "border-box",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      9,

    padding:
      12,

    background:
      "white",

    outline:
      "none",

    resize:
      "vertical",

    marginTop:
      6

  };


const twoColumns:
  CSSProperties = {

    display:
      "grid",

    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",

    gap:
      12

  };


const parkingCard:
  CSSProperties = {

    marginBottom:
      14,

    padding:
      15,

    border:
      "1px solid #e2e8f0",

    borderRadius:
      12,

    background:
      "#f8fafc"

  };


const parkingHeader:
  CSSProperties = {

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap:
      12,

    flexWrap:
      "wrap",

    marginBottom:
      10

  };


const checkboxLabel:
  CSSProperties = {

    display:
      "inline-flex",

    alignItems:
      "center",

    gap:
      7,

    fontSize:
      12,

    fontWeight:
      700,

    color:
      "#334155",

    cursor:
      "pointer"

  };


const overlay:
  CSSProperties = {

    position:
      "fixed",

    inset:
      0,

    zIndex:
      3000,

    background:
      "rgba(15,23,42,.58)",

    overflowY:
      "auto",

    padding:
      "30px 20px",

    boxSizing:
      "border-box"

  };


const modal:
  CSSProperties = {

    width:
      "100%",

    maxWidth:
      700,

    maxHeight:
      "calc(100vh - 60px)",

    overflowY:
      "auto",

    background:
      "white",

    borderRadius:
      18,

    padding:
      25,

    boxSizing:
      "border-box",

    margin:
      "0 auto 30px",

    boxShadow:
      "0 25px 80px rgba(15,23,42,.18)"

  };


const modalHeader:
  CSSProperties = {

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "flex-start",

    gap:
      15,

    marginBottom:
      20

  };


const modalFooter:
  CSSProperties = {

    display:
      "flex",

    justifyContent:
      "flex-end",

    gap:
      8,

    marginTop:
      18,

    paddingTop:
      15,

    borderTop:
      "1px solid #f1f5f9"

  };


const closeButton:
  CSSProperties = {

    width:
      36,

    height:
      36,

    border:
      0,

    background:
      "#f1f5f9",

    borderRadius:
      9,

    cursor:
      "pointer",

    display:
      "grid",

    placeItems:
      "center"

  };