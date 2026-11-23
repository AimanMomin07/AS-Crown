import {
  useCallback,
  useEffect,
  useState
} from "react";

import type {
  FormEvent
} from "react";

import {
  Plus,
  Search,
  RefreshCw,
  X,
  Save,
  Trash2
} from "lucide-react";

import {
  getStaff,
  createStaff
} from "../../api/society.api";

import {
  getAdminUsers
} from "../../api/admin.api";

import {
  removeStaff
} from "../../api/staff.api";


interface Staff {

  id:
    number;

  employee_id:
    string;

  first_name?:
    string | null;

  last_name?:
    string | null;

  department?:
    string | null;

  designation?:
    string | null;

  joining_date?:
    string | null;

  salary?:
    number |
    string |
    null;

  emergency_contact_name?:
    string | null;

  emergency_contact_phone?:
    string | null;

  status:
    string;

}


interface StaffUser {

  id:
    number;

  first_name:
    string;

  last_name?:
    string | null;

  email?:
    string | null;

}


interface StaffForm {

  userId:
    string;

  employeeId:
    string;

  department:
    string;

  designation:
    string;

  joiningDate:
    string;

  salary:
    string;

  emergencyContactName:
    string;

  emergencyContactPhone:
    string;

}


const EMPTY_FORM:
  StaffForm = {

    userId:
      "",

    employeeId:
      "",

    department:
      "",

    designation:
      "",

    joiningDate:
      "",

    salary:
      "",

    emergencyContactName:
      "",

    emergencyContactPhone:
      ""

  };


export default function AdminStaff() {

  const [
    staff,
    setStaff
  ] =
    useState<Staff[]>([]);


  const [
    users,
    setUsers
  ] =
    useState<StaffUser[]>([]);


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
    removingId,
    setRemovingId
  ] =
    useState<number | null>(
      null
    );


  const [
    showModal,
    setShowModal
  ] =
    useState(false);


  const [
    search,
    setSearch
  ] =
    useState("");


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
    useState<StaffForm>(
      EMPTY_FORM
    );


  /* =========================================================
     LOAD STAFF
  ========================================================= */

  const loadStaff =
    useCallback(
      async () => {

        try {

          setLoading(
            true
          );

          setError("");


          const response =
            await getStaff({

              search:
                search.trim() ||
                undefined

            });


          setStaff(
            response?.data?.staff ||
            []
          );

        } catch (
          requestError: any
        ) {

          console.error(
            "Load staff error:",
            requestError
          );


          setError(
            requestError
              ?.response
              ?.data
              ?.message ||
            "Unable to load staff."
          );

        } finally {

          setLoading(
            false
          );

        }

      },
      [
        search
      ]
    );


  /* =========================================================
     LOAD USER ACCOUNTS
  ========================================================= */

  async function loadUsers() {

    try {

      const response =
        await getAdminUsers({

          role:
            "staff",

          status:
            "active",

          limit:
            100

        });


      setUsers(
        response?.data?.users ||
        []
      );

    } catch (
      requestError
    ) {

      console.error(
        "Load staff users error:",
        requestError
      );

    }

  }


  useEffect(() => {

    void loadStaff();

  }, [
    loadStaff
  ]);


  useEffect(() => {

    void loadUsers();

  }, []);


  /* =========================================================
     OPEN CREATE MODAL
  ========================================================= */

  function openCreate() {

    setError("");

    setSuccess("");

    setForm({
      ...EMPTY_FORM
    });

    setShowModal(
      true
    );

  }


  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  function closeModal() {

    if (
      saving
    ) {

      return;

    }


    setShowModal(
      false
    );

  }


  /* =========================================================
     CREATE STAFF
  ========================================================= */

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError("");

    setSuccess("");


    if (
      !form.employeeId.trim()
    ) {

      setError(
        "Employee ID is required."
      );

      return;

    }


    try {

      setSaving(
        true
      );


      await createStaff({

        userId:
          form.userId
            ? Number(
                form.userId
              )
            : null,

        employeeId:
          form.employeeId.trim(),

        department:
          form.department.trim() ||
          null,

        designation:
          form.designation.trim() ||
          null,

        joiningDate:
          form.joiningDate ||
          null,

        salary:
          form.salary
            ? Number(
                form.salary
              )
            : null,

        emergencyContactName:
          form.emergencyContactName.trim() ||
          null,

        emergencyContactPhone:
          form.emergencyContactPhone.trim() ||
          null

      });


      setShowModal(
        false
      );


      setForm({
        ...EMPTY_FORM
      });


      setSuccess(
        "Staff member created successfully."
      );


      await loadStaff();

    } catch (
      requestError: any
    ) {

      console.error(
        "Create staff error:",
        requestError
      );


      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
        "Unable to create staff member."
      );

    } finally {

      setSaving(
        false
      );

    }

  }


  /* =========================================================
     REMOVE STAFF
  ========================================================= */

  async function handleRemoveStaff(
    id:
      number
  ) {

    const confirmed =
      window.confirm(
        "Remove this staff member?\n\nTheir historical attendance and records will be preserved."
      );


    if (
      !confirmed
    ) {

      return;

    }


    try {

      setRemovingId(
        id
      );

      setError("");

      setSuccess("");


      await removeStaff(
        id
      );


      /*
       * Refresh the active staff list.
       */
      await loadStaff();


      setSuccess(
        "Staff member removed successfully."
      );

    } catch (
      requestError: any
    ) {

      console.error(
        "Remove staff error:",
        requestError
      );


      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
        "Unable to remove staff member."
      );

    } finally {

      setRemovingId(
        null
      );

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

        {/* =================================================
            HEADER
        ================================================= */}

        <header
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
              OPERATIONS
            </div>


            <h1
              style={
                title
              }
            >
              Staff
            </h1>


            <p
              style={
                description
              }
            >
              Manage society employees and operational staff.
            </p>

          </div>


          <div
            style={
              headerActions
            }
          >

            <button
              type="button"

              onClick={() =>
                void loadStaff()
              }

              style={
                secondaryButton
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

              onClick={
                openCreate
              }

              style={
                primaryButton
              }
            >

              <Plus
                size={
                  17
                }
              />

              Add Staff

            </button>

          </div>

        </header>


        {/* =================================================
            MESSAGES
        ================================================= */}

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


        {/* =================================================
            SEARCH
        ================================================= */}

        <div
          style={
            searchCard
          }
        >

          <div
            style={
              searchWrapper
            }
          >

            <Search
              size={
                17
              }

              style={
                searchIcon
              }
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
                "Search employee, department or designation"

              style={{
                ...input,
                paddingLeft:
                  40
              }}
            />

          </div>

        </div>


        {/* =================================================
            TABLE
        ================================================= */}

        <div
          style={
            tableContainer
          }
        >

          <div
            style={
              tableScroll
            }
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
                    Employee
                  </th>


                  <th
                    style={
                      th
                    }
                  >
                    Department
                  </th>


                  <th
                    style={
                      th
                    }
                  >
                    Designation
                  </th>


                  <th
                    style={
                      th
                    }
                  >
                    Joining
                  </th>


                  <th
                    style={
                      th
                    }
                  >
                    Salary
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
                    Actions
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
                      Loading staff...
                    </td>

                  </tr>

                ) : staff.length === 0 ? (

                  <tr>

                    <td
                      colSpan={
                        7
                      }

                      style={
                        empty
                      }
                    >
                      No staff records found.
                    </td>

                  </tr>

                ) : (

                  staff.map(
                    member => (

                      <tr
                        key={
                          member.id
                        }

                        style={
                          row
                        }
                      >

                        {/* EMPLOYEE */}

                        <td
                          style={
                            td
                          }
                        >

                          <strong>
                            {
                              member.employee_id
                            }
                          </strong>


                          <div
                            style={
                              small
                            }
                          >

                            {
                              member.first_name ||
                              ""
                            }{" "}

                            {
                              member.last_name ||
                              ""
                            }

                          </div>

                        </td>


                        {/* DEPARTMENT */}

                        <td
                          style={
                            td
                          }
                        >

                          {
                            member.department ||
                            "—"
                          }

                        </td>


                        {/* DESIGNATION */}

                        <td
                          style={
                            td
                          }
                        >

                          {
                            member.designation ||
                            "—"
                          }

                        </td>


                        {/* JOINING */}

                        <td
                          style={
                            td
                          }
                        >

                          {
                            member.joining_date
                              ? new Date(
                                  member.joining_date
                                ).toLocaleDateString(
                                  "en-IN"
                                )
                              : "—"
                          }

                        </td>


                        {/* SALARY */}

                        <td
                          style={
                            td
                          }
                        >

                          {
                            member.salary !==
                            null &&
                            member.salary !==
                            undefined

                              ? `₹${Number(
                                  member.salary
                                ).toLocaleString(
                                  "en-IN"
                                )}`

                              : "—"
                          }

                        </td>


                        {/* STATUS */}

                        <td
                          style={
                            td
                          }
                        >

                          <span
                            style={
                              statusBadge(
                                member.status
                              )
                            }
                          >
                            {
                              member.status
                            }
                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td
                          style={
                            td
                          }
                        >

                          <button
                            type="button"

                            onClick={() =>
                              void handleRemoveStaff(
                                member.id
                              )
                            }

                            disabled={
                              member.status !==
                                "active" ||
                              removingId ===
                                member.id
                            }

                            style={{
                              ...removeButton,

                              opacity:
                                member.status !==
                                  "active" ||
                                removingId ===
                                  member.id
                                  ? 0.55
                                  : 1,

                              cursor:
                                member.status !==
                                  "active" ||
                                removingId ===
                                  member.id
                                  ? "not-allowed"
                                  : "pointer"
                            }}
                          >

                            <Trash2
                              size={
                                15
                              }
                            />

                            {
                              removingId ===
                              member.id

                                ? "Removing..."

                                : member.status ===
                                  "active"

                                  ? "Remove"

                                  : "Removed"
                            }

                          </button>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* =================================================
            CREATE MODAL
        ================================================= */}

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
                    NEW STAFF
                  </div>


                  <h2
                    style={
                      modalTitle
                    }
                  >
                    Add Staff Member
                  </h2>

                </div>


                <button
                  type="button"

                  onClick={
                    closeModal
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
                label="Employee ID"
                value={
                  form.employeeId
                }

                onChange={
                  value =>
                    setForm(
                      current => ({
                        ...current,
                        employeeId:
                          value
                      })
                    )
                }

                required
              />


              <Field
                label="Department"
                value={
                  form.department
                }

                onChange={
                  value =>
                    setForm(
                      current => ({
                        ...current,
                        department:
                          value
                      })
                    )
                }
              />


              <Field
                label="Designation"
                value={
                  form.designation
                }

                onChange={
                  value =>
                    setForm(
                      current => ({
                        ...current,
                        designation:
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
                  label="Joining Date"
                  type="date"

                  value={
                    form.joiningDate
                  }

                  onChange={
                    value =>
                      setForm(
                        current => ({
                          ...current,
                          joiningDate:
                            value
                        })
                      )
                  }
                />


                <Field
                  label="Salary"
                  type="number"

                  value={
                    form.salary
                  }

                  onChange={
                    value =>
                      setForm(
                        current => ({
                          ...current,
                          salary:
                            value
                        })
                      )
                  }
                />

              </div>


              <Field
                label="Emergency Contact Name"
                value={
                  form.emergencyContactName
                }

                onChange={
                  value =>
                    setForm(
                      current => ({
                        ...current,
                        emergencyContactName:
                          value
                      })
                    )
                }
              />


              <Field
                label="Emergency Contact Phone"
                value={
                  form.emergencyContactPhone
                }

                onChange={
                  value =>
                    setForm(
                      current => ({
                        ...current,
                        emergencyContactPhone:
                          value
                      })
                    )
                }
              />


              <label
                style={
                  labelStyle
                }
              >

                <span>
                  Existing Staff Login User
                </span>


                <select
                  value={
                    form.userId
                  }

                  onChange={
                    event =>
                      setForm(
                        current => ({
                          ...current,
                          userId:
                            event.target.value
                        })
                      )
                  }

                  style={
                    input
                  }
                >

                  <option
                    value=""
                  >
                    No linked login account
                  </option>


                  {users.map(
                    account => (

                      <option
                        key={
                          account.id
                        }

                        value={
                          account.id
                        }
                      >

                        {
                          account.first_name
                        }{" "}

                        {
                          account.last_name ||
                          ""
                        }

                        {" — "}

                        {
                          account.email ||
                          `ID ${account.id}`
                        }

                      </option>

                    )
                  )}

                </select>

              </label>


              {/* MODAL FOOTER */}

              <div
                style={
                  modalFooter
                }
              >

                <button
                  type="button"

                  onClick={
                    closeModal
                  }

                  style={
                    secondaryButton
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"

                  disabled={
                    saving
                  }

                  style={{
                    ...primaryButton,

                    opacity:
                      saving
                        ? 0.65
                        : 1,

                    cursor:
                      saving
                        ? "not-allowed"
                        : "pointer"
                  }}
                >

                  <Save
                    size={
                      16
                    }
                  />


                  {
                    saving
                      ? "Creating..."
                      : "Create Staff"
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


/* =========================================================
   FIELD COMPONENT
========================================================= */

function Field({
  label,
  value,
  onChange,
  required = false,
  type = "text"
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
        labelStyle
      }
    >

      <span>
        {
          label
        }
      </span>


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


/* =========================================================
   MESSAGE
========================================================= */

function Message({
  type,
  text
}: {
  type:
    | "error"
    | "success";

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
          type ===
          "error"

            ? "#fef2f2"

            : "#ecfdf5",

        color:
          type ===
          "error"

            ? "#b91c1c"

            : "#047857",

        border:
          type ===
          "error"

            ? "1px solid #fecaca"

            : "1px solid #a7f3d0"
      }}
    >

      {
        text
      }

    </div>

  );

}


/* =========================================================
   STATUS BADGE
========================================================= */

function statusBadge(
  status:
    string
): React.CSSProperties {

  const active =
    status ===
    "active";


  return {

    display:
      "inline-flex",

    padding:
      "5px 9px",

    borderRadius:
      999,

    background:
      active
        ? "#ecfdf5"
        : "#f1f5f9",

    color:
      active
        ? "#047857"
        : "#64748b",

    fontSize:
      11,

    fontWeight:
      700,

    textTransform:
      "capitalize"

  };

}


/* =========================================================
   STYLES
========================================================= */

const page:
  React.CSSProperties = {

    minHeight:
      "100vh",

    background:
      "#f8fafc",

    padding:
      28

  };


const container:
  React.CSSProperties = {

    maxWidth:
      1400,

    margin:
      "0 auto"

  };


const header:
  React.CSSProperties = {

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap:
      16,

    flexWrap:
      "wrap",

    marginBottom:
      22

  };


const headerActions:
  React.CSSProperties = {

    display:
      "flex",

    gap:
      9,

    alignItems:
      "center"

  };


const eyebrow:
  React.CSSProperties = {

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
  React.CSSProperties = {

    margin:
      "5px 0",

    fontSize:
      30,

    color:
      "#0f172a"

  };


const description:
  React.CSSProperties = {

    margin:
      0,

    color:
      "#64748b"

  };


const primaryButton:
  React.CSSProperties = {

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


const secondaryButton:
  React.CSSProperties = {

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
      600

  };


const removeButton:
  React.CSSProperties = {

    height:
      34,

    padding:
      "0 11px",

    border:
      "1px solid #fecaca",

    borderRadius:
      8,

    background:
      "#fef2f2",

    color:
      "#b91c1c",

    display:
      "inline-flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    gap:
      6,

    fontWeight:
      700

  };


const searchCard:
  React.CSSProperties = {

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      14,

    padding:
      14,

    marginBottom:
      16

  };


const searchWrapper:
  React.CSSProperties = {

    position:
      "relative"

  };


const searchIcon:
  React.CSSProperties = {

    position:
      "absolute",

    left:
      13,

    top:
      "50%",

    transform:
      "translateY(-50%)",

    color:
      "#94a3b8",

    pointerEvents:
      "none"

  };


const input:
  React.CSSProperties = {

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
      "none"

  };


const tableContainer:
  React.CSSProperties = {

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      16,

    overflow:
      "hidden"

  };


const tableScroll:
  React.CSSProperties = {

    overflowX:
      "auto"

  };


const table:
  React.CSSProperties = {

    width:
      "100%",

    minWidth:
      900,

    borderCollapse:
      "collapse"

  };


const th:
  React.CSSProperties = {

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

    letterSpacing:
      0.5,

    background:
      "#f8fafc",

    whiteSpace:
      "nowrap"

  };


const td:
  React.CSSProperties = {

    padding:
      "14px 16px",

    fontSize:
      13,

    color:
      "#334155",

    verticalAlign:
      "middle"

  };


const row:
  React.CSSProperties = {

    borderTop:
      "1px solid #f1f5f9"

  };


const empty:
  React.CSSProperties = {

    padding:
      50,

    textAlign:
      "center",

    color:
      "#94a3b8"

  };


const small:
  React.CSSProperties = {

    fontSize:
      11,

    color:
      "#94a3b8",

    marginTop:
      3

  };


const labelStyle:
  React.CSSProperties = {

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


const twoColumns:
  React.CSSProperties = {

    display:
      "grid",

    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",

    gap:
      12

  };


const overlay:
  React.CSSProperties = {

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


const modal:
  React.CSSProperties = {

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
      25,

    boxSizing:
      "border-box",

    boxShadow:
      "0 25px 80px rgba(0,0,0,.2)"

  };


const modalHeader:
  React.CSSProperties = {

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    marginBottom:
      20

  };


const modalTitle:
  React.CSSProperties = {

    margin:
      "4px 0 0",

    fontSize:
      21,

    color:
      "#0f172a"

  };


const closeButton:
  React.CSSProperties = {

    width:
      36,

    height:
      36,

    border:
      0,

    borderRadius:
      9,

    background:
      "#f1f5f9",

    cursor:
      "pointer",

    display:
      "grid",

    placeItems:
      "center"

  };


const modalFooter:
  React.CSSProperties = {

    display:
      "flex",

    justifyContent:
      "flex-end",

    gap:
      10,

    borderTop:
      "1px solid #f1f5f9",

    paddingTop:
      15,

    marginTop:
      8

  };