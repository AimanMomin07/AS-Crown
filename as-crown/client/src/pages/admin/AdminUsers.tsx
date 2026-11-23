import type {
  CSSProperties
} from "react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Search,
  RefreshCw,
  UserPlus,
  X,
  Home,
  UserRound,
  UserX,
  CheckCircle2
} from "lucide-react";

import {
  assignResidentFlat,
  removeResidentFromFlat,
  removeResident
} from "../../api/residents.api";

import {
  getFlats
} from "../../api/flats.api";

import {
  createAdminUser,
  getAdminUsers,
  updateAdminUserStatus
} from "../../api/admin.api";


/* =========================================================
   USER
========================================================= */

interface AdminUser {

  id:
    number;

  first_name:
    string;

  last_name?:
    string | null;

  email?:
    string | null;

  mobile?:
    string | null;

  status:
    string;

  role_name?:
    string;

  created_at:
    string;

}


/* =========================================================
   FLAT
========================================================= */

interface ResidentFlat {

  id:
    number;

  building_id:
    number;

  flat_number:
    string;

  floor_number:
    number;

  flat_type?:
    string | null;

  area_sqft?:
    number | null;

  owner_id?:
    number | null;

  tenant_id?:
    number | null;

  occupancy_status?:
    string;

  status:
    string;

  building_name?:
    string | null;

  building_code?:
    string | null;

  owner_first_name?:
    string | null;

  owner_last_name?:
    string | null;

}


/* =========================================================
   COMPONENT
========================================================= */

export default function AdminUsers() {

  /* -------------------------------------------------------
     USERS
  ------------------------------------------------------- */

  const [
    users,
    setUsers
  ] =
    useState<AdminUser[]>([]);


  /* -------------------------------------------------------
     FLATS
  ------------------------------------------------------- */

  const [
    flats,
    setFlats
  ] =
    useState<ResidentFlat[]>([]);


  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    flatsLoading,
    setFlatsLoading
  ] =
    useState(true);


  /* -------------------------------------------------------
     SEARCH / FILTER
  ------------------------------------------------------- */

  const [
    search,
    setSearch
  ] =
    useState("");


  const [
    role,
    setRole
  ] =
    useState("resident");


  const [
    page,
    setPage
  ] =
    useState(1);


  const [
    totalPages,
    setTotalPages
  ] =
    useState(1);


  /* -------------------------------------------------------
     MESSAGES
  ------------------------------------------------------- */

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


  /* -------------------------------------------------------
     CREATE RESIDENT
  ------------------------------------------------------- */

  const [
    showCreate,
    setShowCreate
  ] =
    useState(false);


  const [
    saving,
    setSaving
  ] =
    useState(false);


  const [
    form,
    setForm
  ] =
    useState({

      firstName:
        "",

      lastName:
        "",

      email:
        "",

      mobile:
        "",

      password:
        "",

      roleId:
        "2"

    });


  const CREATE_ROLES = [
    { id: "2", name: "Resident", plural: "Residents" },
    { id: "3", name: "Staff", plural: "Staff" },
    { id: "4", name: "Security", plural: "Security" },
    { id: "5", name: "Committee", plural: "Committee" }
  ] as const;


  const selectedCreateRole =
    CREATE_ROLES.find(
      item => item.id === form.roleId
    ) || CREATE_ROLES[0];


  /* -------------------------------------------------------
     ASSIGN FLAT
  ------------------------------------------------------- */

  const [
    assigningUser,
    setAssigningUser
  ] =
    useState<AdminUser | null>(
      null
    );


  const [
    selectedFlatId,
    setSelectedFlatId
  ] =
    useState("");


  const [
    assigning,
    setAssigning
  ] =
    useState(false);


  /* -------------------------------------------------------
     REMOVE ACTION
  ------------------------------------------------------- */

  const [
    removingUserId,
    setRemovingUserId
  ] =
    useState<number | null>(
      null
    );


  const [
    removingFlatUserId,
    setRemovingFlatUserId
  ] =
    useState<number | null>(
      null
    );


  /* =========================================================
     LOAD USERS
  ========================================================= */

  const loadUsers =
    useCallback(
      async () => {

        try {

          setLoading(
            true
          );

          setError("");


          const response =
            await getAdminUsers({

              search:
                search ||
                undefined,

              role:
                role ||
                undefined,

              page,

              limit:
                20

            });


          setUsers(
            response?.data?.users ||
            []
          );


          setTotalPages(
            response?.data?.pagination
              ?.totalPages ||
            1
          );

        } catch (
          requestError: any
        ) {

          console.error(
            "Load residents error:",
            requestError
          );


          setError(
            requestError
              ?.response
              ?.data
              ?.message ||
            "Unable to load residents."
          );

        } finally {

          setLoading(
            false
          );

        }

      },
      [
        search,
        role,
        page
      ]
    );


  /* =========================================================
     LOAD FLATS
  ========================================================= */

  const loadFlats =
    useCallback(
      async () => {

        try {

          setFlatsLoading(
            true
          );


          const response =
            await getFlats({
              status:
                "active"
            });


          setFlats(
            response?.data?.flats ||
            []
          );

        } catch (
          requestError: any
        ) {

          console.error(
            "Load flats error:",
            requestError
          );


          setError(
            requestError
              ?.response
              ?.data
              ?.message ||
            "Unable to load flats."
          );

        } finally {

          setFlatsLoading(
            false
          );

        }

      },
      []
    );


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {

    void loadUsers();

  }, [
    loadUsers
  ]);


  useEffect(() => {

    void loadFlats();

  }, [
    loadFlats
  ]);


  /* =========================================================
     BUILD FLAT LOOKUP
  ========================================================= */

  const flatByOwner =
    useMemo(() => {

      const map =
        new Map<
          number,
          ResidentFlat
        >();


      for (
        const flat
        of flats
      ) {

        if (
          flat.owner_id
        ) {

          map.set(
            Number(
              flat.owner_id
            ),
            flat
          );

        }

      }


      return map;

    }, [
      flats
    ]);


  /* =========================================================
     AVAILABLE FLATS
  ========================================================= */

  const availableFlats =
    useMemo(() => {

      return flats.filter(
        flat => {

          if (
            flat.status !==
            "active"
          ) {

            return false;

          }


          /*
           * Allow the current
           * resident's existing
           * flat to appear while
           * changing flats.
           */

          if (
            assigningUser &&
            flat.owner_id ===
              assigningUser.id
          ) {

            return true;

          }


          /*
           * Don't allow a flat that
           * already has another owner.
           */

          if (
            flat.owner_id
          ) {

            return false;

          }


          return true;

        }
      );

    }, [
      flats,
      assigningUser
    ]);


  /* =========================================================
     CURRENT FLAT
  ========================================================= */

  function getResidentFlat(
    userId: number
  ) {

    return flatByOwner.get(
      userId
    );

  }


  /* =========================================================
     CREATE RESIDENT
  ========================================================= */

  async function handleCreateResident(
    event: React.FormEvent
  ) {

    event.preventDefault();


    setError("");

    setSuccess("");


    if (
      !form.firstName.trim()
    ) {

      setError(
        "First name is required."
      );

      return;

    }


    if (
      form.password.length <
      8
    ) {

      setError(
        "Password must contain at least 8 characters."
      );

      return;

    }


    if (
      !form.email.trim() &&
      !form.mobile.trim()
    ) {

      setError(
        "Email or mobile is required."
      );

      return;

    }


    try {

      setSaving(
        true
      );


      await createAdminUser({

        firstName:
          form.firstName.trim(),

        lastName:
          form.lastName.trim(),

        email:
          form.email.trim() ||
          undefined,

        mobile:
          form.mobile.trim() ||
          undefined,

        password:
          form.password,

        roleId:
          Number(form.roleId)

      });


      setShowCreate(
        false
      );


      setForm({

        firstName:
          "",

        lastName:
          "",

        email:
          "",

        mobile:
          "",

        password:
          "",

        roleId:
          "2"

      });


      setSuccess(
        `${selectedCreateRole.name} account created successfully.`
      );


      await loadUsers();

    } catch (
      requestError: any
    ) {

      console.error(
        "Create resident error:",
        requestError
      );


      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
        "Unable to create resident."
      );

    } finally {

      setSaving(
        false
      );

    }

  }


  /* =========================================================
     OPEN ASSIGN FLAT
  ========================================================= */

  function openAssignFlat(
    user: AdminUser
  ) {

    const currentFlat =
      getResidentFlat(
        user.id
      );


    setAssigningUser(
      user
    );


    setSelectedFlatId(
      currentFlat
        ? String(
            currentFlat.id
          )
        : ""
    );


    setError("");

    setSuccess("");

  }


  /* =========================================================
     CLOSE ASSIGN MODAL
  ========================================================= */

  function closeAssignModal() {

    if (
      assigning
    ) {

      return;

    }


    setAssigningUser(
      null
    );


    setSelectedFlatId("");

  }


  /* =========================================================
     ASSIGN FLAT
  ========================================================= */

  async function handleAssignFlat() {

    if (
      !assigningUser
    ) {

      return;

    }


    const flatId =
      Number(
        selectedFlatId
      );


    if (
      !Number.isInteger(
        flatId
      ) ||
      flatId <= 0
    ) {

      setError(
        "Please select a flat."
      );

      return;

    }


    try {

      setAssigning(
        true
      );

      setError("");

      setSuccess("");


      await assignResidentFlat(
        assigningUser.id,
        flatId
      );


      closeAssignModal();


      setSuccess(
        `Flat assigned successfully to ${assigningUser.first_name}.`
      );


      /*
       * Reload BOTH datasets.
       *
       * Residents now knows
       * their flat.
       *
       * Flats now knows the
       * new owner.
       */

      await Promise.all([
        loadUsers(),
        loadFlats()
      ]);

    } catch (
      requestError: any
    ) {

      console.error(
        "Assign flat error:",
        requestError
      );


      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
        "Unable to assign flat."
      );

    } finally {

      setAssigning(
        false
      );

    }

  }


  /* =========================================================
     REMOVE RESIDENT FROM FLAT
  ========================================================= */

  async function handleRemoveFromFlat(
    user: AdminUser
  ) {

    const flat =
      getResidentFlat(
        user.id
      );


    if (
      !flat
    ) {

      setError(
        "This resident has no assigned flat."
      );

      return;

    }


    const confirmed =
      window.confirm(
        `Remove ${user.first_name} ${user.last_name || ""} from ${flat.flat_number}?`
      );


    if (
      !confirmed
    ) {

      return;

    }


    try {

      setRemovingFlatUserId(
        user.id
      );

      setError("");

      setSuccess("");


      await removeResidentFromFlat(
        user.id
      );


      setSuccess(
        `${user.first_name}'s flat assignment was removed.`
      );


      await Promise.all([
        loadUsers(),
        loadFlats()
      ]);

    } catch (
      requestError: any
    ) {

      console.error(
        "Remove flat error:",
        requestError
      );


      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
        "Unable to remove resident from flat."
      );

    } finally {

      setRemovingFlatUserId(
        null
      );

    }

  }


  /* =========================================================
     REMOVE RESIDENT ACCOUNT
  ========================================================= */

  async function handleRemoveResident(
    user: AdminUser
  ) {

    const flat =
      getResidentFlat(
        user.id
      );


    const flatText =
      flat
        ? ` Their flat ${flat.flat_number} will also be released.`
        : "";


    const confirmed =
      window.confirm(
        `Remove resident ${user.first_name} ${user.last_name || ""}?${flatText}`
      );


    if (
      !confirmed
    ) {

      return;

    }


    try {

      setRemovingUserId(
        user.id
      );

      setError("");

      setSuccess("");


      await removeResident(
        user.id
      );


      setSuccess(
        `${user.first_name} was removed successfully.`
      );


      await Promise.all([
        loadUsers(),
        loadFlats()
      ]);

    } catch (
      requestError: any
    ) {

      console.error(
        "Remove resident error:",
        requestError
      );


      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
        "Unable to remove resident."
      );

    } finally {

      setRemovingUserId(
        null
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
          "28px",

        boxSizing:
          "border-box"
      }}
    >

      <div
        style={{
          maxWidth:
            "1500px",

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
              "15px",

            flexWrap:
              "wrap",

            marginBottom:
              "22px"
          }}
        >

          <div>

            <div
              style={
                eyebrow
              }
            >
              COMMUNITY
            </div>


            <h1
              style={
                h1
              }
            >
              Residents
            </h1>


            <p
              style={
                muted
              }
            >
              Manage residents, flat assignments and occupancy from one place.
            </p>

          </div>


          <div
            style={{
              display:
                "flex",

              gap:
                "8px",

              flexWrap:
                "wrap"
            }}
          >

            <button
              type="button"

              onClick={() => {

                void loadUsers();

                void loadFlats();

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

              onClick={() =>
                setShowCreate(
                  true
                )
              }

              style={
                primary
              }
            >

              <UserPlus
                size={17}
              />

              Add {
                selectedCreateRole.name
              }

            </button>

          </div>

        </div>


        {/* ===================================================
            ALERTS
        =================================================== */}

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
            <CheckCircle2
              size={17}
            />

            {success}

          </div>

        )}


        {/* ===================================================
            SUMMARY
        =================================================== */}

        <div
          style={{
            display:
              "grid",

            gridTemplateColumns:
              "repeat(auto-fit,minmax(190px,1fr))",

            gap:
              "14px",

            marginBottom:
              "18px"
          }}
        >

          <SummaryCard
            label="Residents"
            value={
              users.length
            }
            icon={
              <UserRound
                size={20}
              />
            }
          />


          <SummaryCard
            label="Assigned in this view"
            value={
              users.filter(
                user =>
                  Boolean(
                    getResidentFlat(
                      user.id
                    )
                  )
              ).length
            }
            icon={
              <Home
                size={20}
              />
            }
          />


          <SummaryCard
            label="Available flats"
            value={
              availableFlats.length
            }
            icon={
              <Home
                size={20}
              />
            }
          />

        </div>


        {/* ===================================================
            FILTERS
        =================================================== */}

        <div
          style={
            toolbar
          }
        >

          <div
            style={{
              display:
                "flex",

              gap:
                "10px",

              width:
                "100%",

              flexWrap:
                "wrap"
            }}
          >

            <div
              style={{
                position:
                  "relative",

                flex:
                  1,

                minWidth:
                  "240px"
              }}
            >

              <Search
                size={17}

                style={{
                  position:
                    "absolute",

                  left:
                    "13px",

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
                  event => {

                    setSearch(
                      event.target.value
                    );

                    setPage(
                      1
                    );

                  }
                }

                placeholder=
                  "Search resident, email or mobile"

                style={{
                  ...input,

                  paddingLeft:
                    "40px"
                }}
              />

            </div>


            <select
              value={
                role
              }

              onChange={
                event => {

                  setRole(
                    event.target.value
                  );

                  setPage(
                    1
                  );

                }
              }

              style={{
                ...input,

                width:
                  "180px"
              }}
            >

              <option value="resident">
                Residents
              </option>

              <option value="">
                All Users
              </option>

              <option value="staff">
                Staff
              </option>

              <option value="security">
                Security
              </option>

              <option value="committee">
                Committee
              </option>

            </select>

          </div>

        </div>


        {/* ===================================================
            TABLE
        =================================================== */}

        <div
          style={
            tableWrap
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
                    Resident
                  </th>


                  <th
                    style={
                      th
                    }
                  >
                    Contact
                  </th>


                  <th
                    style={
                      th
                    }
                  >
                    Flat
                  </th>


                  <th
                    style={
                      th
                    }
                  >
                    Role
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
                    Joined
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
                      Loading residents...
                    </td>

                  </tr>

                ) : users.length === 0 ? (

                  <tr>

                    <td
                      colSpan={
                        7
                      }

                      style={
                        empty
                      }
                    >
                      No residents found.
                    </td>

                  </tr>

                ) : (

                  users.map(
                    user => {

                      const flat =
                        getResidentFlat(
                          user.id
                        );


                      return (

                        <tr
                          key={
                            user.id
                          }

                          style={
                            tr
                          }
                        >

                          {/* RESIDENT */}

                          <td
                            style={
                              td
                            }
                          >

                            <strong>

                              {
                                user.first_name
                              }{" "}

                              {
                                user.last_name ||
                                ""
                              }

                            </strong>


                            <div
                              style={
                                small
                              }
                            >
                              ID #{user.id}
                            </div>

                          </td>


                          {/* CONTACT */}

                          <td
                            style={
                              td
                            }
                          >

                            <div>
                              {
                                user.email ||
                                "—"
                              }
                            </div>


                            <div
                              style={
                                small
                              }
                            >
                              {
                                user.mobile ||
                                "—"
                              }
                            </div>

                          </td>


                          {/* FLAT */}

                          <td
                            style={
                              td
                            }
                          >

                            {flat ? (

                              <>

                                <div
                                  style={{
                                    display:
                                      "flex",

                                    alignItems:
                                      "center",

                                    gap:
                                      "7px",

                                    fontWeight:
                                      700
                                  }}
                                >

                                  <Home
                                    size={15}
                                    color="#2563eb"
                                  />

                                  {
                                    flat.flat_number
                                  }

                                </div>


                                <div
                                  style={
                                    small
                                  }
                                >

                                  {
                                    flat.building_name ||
                                    flat.building_code ||
                                    "Building"
                                  }

                                  {" • "}

                                  {
                                    flat.flat_type ||
                                    "Flat"
                                  }

                                </div>


                                <div
                                  style={{
                                    marginTop:
                                      "4px",

                                    fontSize:
                                      "11px",

                                    fontWeight:
                                      700,

                                    color:
                                      flat.occupancy_status ===
                                      "occupied"
                                        ? "#047857"
                                        : "#b45309"
                                  }}
                                >
                                  {
                                    flat.occupancy_status
                                  }
                                </div>

                              </>

                            ) : (

                              <span
                                style={{
                                  color:
                                    "#94a3b8",

                                  fontSize:
                                    "12px"
                                }}
                              >
                                Unassigned
                              </span>

                            )}

                          </td>


                          {/* ROLE */}

                          <td
                            style={
                              td
                            }
                          >
                            {
                              user.role_name ||
                              "—"
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
                                badge(
                                  user.status
                                )
                              }
                            >
                              {
                                user.status
                              }
                            </span>

                          </td>


                          {/* JOINED */}

                          <td
                            style={
                              td
                            }
                          >
                            {
                              new Date(
                                user.created_at
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            }
                          </td>


                          {/* ACTIONS */}

                          <td
                            style={
                              {
                                ...td,

                                minWidth:
                                  "270px"
                              }
                            }
                          >

                            <div
                              style={{
                                display:
                                  "flex",

                                flexWrap:
                                  "wrap",

                                gap:
                                  "7px"
                              }}
                            >

                              <button
                                type="button"

                                onClick={() =>
                                  openAssignFlat(
                                    user
                                  )
                                }

                                disabled={
                                  user.status !==
                                  "active"
                                }

                                style={{
                                  ...smallButton,

                                  color:
                                    "#2563eb",

                                  background:
                                    "#eff6ff",

                                  border:
                                    "1px solid #bfdbfe"
                                }}
                              >

                                <Home
                                  size={14}
                                />

                                {
                                  flat
                                    ? "Change Flat"
                                    : "Assign Flat"
                                }

                              </button>


                              {flat && (

                                <button
                                  type="button"

                                  onClick={() =>
                                    void handleRemoveFromFlat(
                                      user
                                    )
                                  }

                                  disabled={
                                    removingFlatUserId ===
                                    user.id
                                  }

                                  style={{
                                    ...smallButton,

                                    color:
                                      "#b45309",

                                    background:
                                      "#fff7ed",

                                    border:
                                      "1px solid #fed7aa"
                                  }}
                                >

                                  {
                                    removingFlatUserId ===
                                    user.id
                                      ? "Removing..."
                                      : "Remove Flat"
                                  }

                                </button>

                              )}


                              <button
                                type="button"

                                onClick={() =>
                                  void handleRemoveResident(
                                    user
                                  )
                                }

                                disabled={
                                  removingUserId ===
                                  user.id
                                }

                                style={{
                                  ...smallButton,

                                  color:
                                    "#dc2626",

                                  background:
                                    "#fef2f2",

                                  border:
                                    "1px solid #fecaca"
                                }}
                              >

                                <UserX
                                  size={14}
                                />

                                {
                                  removingUserId ===
                                  user.id
                                    ? "Removing..."
                                    : "Remove Resident"
                                }

                              </button>


                              <select

                                value={
                                  user.status
                                }

                                onChange={
                                  async event => {

                                    try {

                                      await updateAdminUserStatus(
                                        user.id,
                                        event.target.value
                                      );


                                      await loadUsers();

                                    } catch (
                                      statusError
                                    ) {

                                      console.error(
                                        statusError
                                      );


                                      setError(
                                        "Unable to update status."
                                      );

                                    }

                                  }
                                }

                                style={{
                                  ...input,

                                  width:
                                    "125px",

                                  height:
                                    "34px",

                                  marginTop:
                                    0,

                                  fontSize:
                                    "11px"
                                }}
                              >

                                <option value="active">
                                  Active
                                </option>

                                <option value="pending">
                                  Pending
                                </option>

                                <option value="inactive">
                                  Inactive
                                </option>

                                <option value="blocked">
                                  Blocked
                                </option>

                              </select>

                            </div>

                          </td>

                        </tr>

                      );

                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* ===================================================
            PAGINATION
        =================================================== */}

        <div
          style={
            pagination
          }
        >

          <span>
            Page{" "}
            {page}{" "}
            of{" "}
            {totalPages}
          </span>


          <div
            style={{
              display:
                "flex",

              gap:
                "8px"
            }}
          >

            <button
              type="button"

              disabled={
                page <= 1
              }

              onClick={() =>
                setPage(
                  current =>
                    Math.max(
                      1,
                      current - 1
                    )
                )
              }

              style={
                secondary
              }
            >
              Previous
            </button>


            <button
              type="button"

              disabled={
                page >=
                totalPages
              }

              onClick={() =>
                setPage(
                  current =>
                    Math.min(
                      totalPages,
                      current + 1
                    )
                )
              }

              style={
                secondary
              }
            >
              Next
            </button>

          </div>

        </div>

      </div>


      {/* =====================================================
          CREATE RESIDENT MODAL
      ===================================================== */}

      {showCreate && (

        <div
          style={
            overlay
          }
        >

          <form
            onSubmit={
              handleCreateResident
            }

            style={
              modalBox
            }
          >

            <div
              style={
                modalHead
              }
            >

              <div>

                <div
                  style={
                    eyebrow
                  }
                >
                  NEW {
                    selectedCreateRole.name.toUpperCase()
                  }
                </div>


                <h2
                  style={{
                    margin:
                      "4px 0"
                  }}
                >
                  Create {
                    selectedCreateRole.name
                  }
                </h2>

              </div>


              <button
                type="button"

                onClick={() =>
                  setShowCreate(
                    false
                  )
                }

                style={
                  close
                }
              >

                <X
                  size={18}
                />

              </button>

            </div>


            <div
              style={
                two
              }
            >

              <Field
                label="First name"
                value={
                  form.firstName
                }

                onChange={
                  value =>
                    setForm(
                      current => ({
                        ...current,

                        firstName:
                          value
                      })
                    )
                }

                required
              />


              <Field
                label="Last name"
                value={
                  form.lastName
                }

                onChange={
                  value =>
                    setForm(
                      current => ({
                        ...current,

                        lastName:
                          value
                      })
                    )
                }
              />

            </div>


            <div
              style={
                two
              }
            >

              <Field
                label="Email"
                value={
                  form.email
                }

                onChange={
                  value =>
                    setForm(
                      current => ({
                        ...current,

                        email:
                          value
                      })
                    )
                }
              />


              <Field
                label="Mobile"
                value={
                  form.mobile
                }

                onChange={
                  value =>
                    setForm(
                      current => ({
                        ...current,

                        mobile:
                          value
                      })
                    )
                }
              />

            </div>


            <label
              style={{
                display: "grid",
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                color: "#475569",
                marginBottom: 12
              }}
            >
              Account role

              <select
                value={form.roleId}
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    roleId: event.target.value
                  }))
                }
                style={input}
              >
                {CREATE_ROLES.map(item => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </label>


            <Field
              label="Temporary password"
              type="password"

              value={
                form.password
              }

              onChange={
                value =>
                  setForm(
                    current => ({
                      ...current,

                      password:
                        value
                    })
                  )
              }

              required
            />


            <div
              style={{
                background:
                  "#eff6ff",

                color:
                  "#1e3a8a",

                padding:
                  "12px",

                borderRadius:
                  "10px",

                fontSize:
                  "12px",

                marginTop:
                  "5px"
              }}
            >
              The account will be created with the
              <strong>
                {` ${selectedCreateRole.name.toLowerCase()} `}
              </strong>
              role.
            </div>


            <div
              style={
                modalFoot
              }
            >

              <button
                type="button"

                onClick={() =>
                  setShowCreate(
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
                    : `Create ${selectedCreateRole.name}`
                }

              </button>

            </div>

          </form>

        </div>

      )}


      {/* =====================================================
          ASSIGN FLAT MODAL
      ===================================================== */}

      {assigningUser && (

        <div
          style={
            overlay
          }
        >

          <div
            style={{
              ...modalBox,

              maxWidth:
                "620px"
            }}
          >

            <div
              style={
                modalHead
              }
            >

              <div>

                <div
                  style={
                    eyebrow
                  }
                >
                  PROPERTY ASSIGNMENT
                </div>


                <h2
                  style={{
                    margin:
                      "4px 0"
                  }}
                >
                  Assign Flat
                </h2>


                <p
                  style={{
                    margin:
                      "5px 0 0",

                    color:
                      "#64748b",

                    fontSize:
                      "13px"
                  }}
                >
                  Assign a registered AS CROWN flat to{" "}
                  <strong>
                    {
                      assigningUser.first_name
                    }{" "}
                    {
                      assigningUser.last_name ||
                      ""
                    }
                  </strong>
                </p>

              </div>


              <button
                type="button"

                onClick={
                  closeAssignModal
                }

                style={
                  close
                }
              >

                <X
                  size={18}
                />

              </button>

            </div>


            {flatsLoading ? (

              <div
                style={{
                  padding:
                    "35px",

                  textAlign:
                    "center",

                  color:
                    "#64748b"
                }}
              >
                Loading flats...
              </div>

            ) : availableFlats.length === 0 ? (

              <div
                style={{
                  padding:
                    "22px",

                  borderRadius:
                    "12px",

                  background:
                    "#fff7ed",

                  color:
                    "#9a3412"
                }}
              >
                There are currently no available flats to assign.
              </div>

            ) : (

              <>

                <label
                  style={
                    labelStyle
                  }
                >

                  Select Flat

                  <select

                    value={
                      selectedFlatId
                    }

                    onChange={
                      event =>
                        setSelectedFlatId(
                          event.target.value
                        )
                    }

                    style={
                      input
                    }
                  >

                    <option value="">
                      Select a flat
                    </option>


                    {availableFlats.map(
                      flat => (

                        <option
                          key={
                            flat.id
                          }

                          value={
                            flat.id
                          }
                        >

                          {
                            flat.building_name ||
                            flat.building_code ||
                            "Building"
                          }

                          {" • "}

                          {
                            flat.flat_number
                          }

                          {" • "}

                          {
                            flat.flat_type ||
                            "Flat"
                          }

                          {" • Floor "}

                          {
                            flat.floor_number
                          }

                          {" • "}

                          {
                            flat.occupancy_status
                          }

                        </option>

                      )
                    )}

                  </select>

                </label>


                {selectedFlatId && (

                  <FlatPreview
                    flat={
                      flats.find(
                        item =>
                          item.id ===
                          Number(
                            selectedFlatId
                          )
                      )
                    }
                  />

                )}


                <div
                  style={
                    modalFoot
                  }
                >

                  <button
                    type="button"

                    onClick={
                      closeAssignModal
                    }

                    disabled={
                      assigning
                    }

                    style={
                      secondary
                    }
                  >
                    Cancel
                  </button>


                  <button
                    type="button"

                    onClick={() =>
                      void handleAssignFlat()
                    }

                    disabled={
                      assigning ||
                      !selectedFlatId
                    }

                    style={{
                      ...primary,

                      opacity:
                        assigning ||
                        !selectedFlatId
                          ? 0.6
                          : 1
                    }}
                  >

                    {
                      assigning
                        ? "Assigning..."
                        : "Assign Flat"
                    }

                  </button>

                </div>

              </>

            )}

          </div>

        </div>

      )}

    </div>

  );

}


/* =========================================================
   FLAT PREVIEW
========================================================= */

function FlatPreview({
  flat
}: {
  flat:
    ResidentFlat | undefined;
}) {

  if (
    !flat
  ) {

    return null;

  }


  return (

    <div
      style={{
        marginTop:
          "8px",

        marginBottom:
          "8px",

        padding:
          "15px",

        borderRadius:
          "12px",

        background:
          "#eff6ff",

        border:
          "1px solid #bfdbfe"
      }}
    >

      <div
        style={{
          display:
            "flex",

          alignItems:
            "center",

          gap:
            "9px",

          color:
            "#1d4ed8",

          fontWeight:
            700
        }}
      >

        <Home
          size={17}
        />

        {
          flat.building_name ||
          flat.building_code ||
          "Building"
        }

        {" • "}

        {
          flat.flat_number
        }

      </div>


      <div
        style={{
          display:
            "grid",

          gridTemplateColumns:
            "repeat(3,1fr)",

          gap:
            "8px",

          marginTop:
            "10px",

          fontSize:
            "12px",

          color:
            "#475569"
        }}
      >

        <div>
          <strong>
            Type
          </strong>

          <div>
            {
              flat.flat_type ||
              "—"
            }
          </div>
        </div>


        <div>
          <strong>
            Floor
          </strong>

          <div>
            {
              flat.floor_number
            }
          </div>
        </div>


        <div>
          <strong>
            Status
          </strong>

          <div>
            {
              flat.occupancy_status
            }
          </div>
        </div>

      </div>

    </div>

  );

}


/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  icon
}: {
  label:
    string;

  value:
    number;

  icon:
    React.ReactNode;
}) {

  return (

    <div
      style={{
        background:
          "white",

        border:
          "1px solid #e2e8f0",

        borderRadius:
          "14px",

        padding:
          "16px",

        display:
          "flex",

        alignItems:
          "center",

        gap:
          "12px"
      }}
    >

      <div
        style={{
          width:
            "40px",

          height:
            "40px",

          borderRadius:
            "10px",

          background:
            "#eff6ff",

          color:
            "#2563eb",

          display:
            "grid",

          placeItems:
            "center"
        }}
      >
        {icon}
      </div>


      <div>

        <div
          style={{
            fontSize:
              "11px",

            color:
              "#64748b"
          }}
        >
          {label}
        </div>


        <strong
          style={{
            display:
              "block",

            marginTop:
              "3px",

            fontSize:
              "21px"
          }}
        >
          {value}
        </strong>

      </div>

    </div>

  );

}


/* =========================================================
   FIELD
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
      value: string
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

      {label}


      <input

        required={
          required
        }

        type={
          type
        }

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

      />

    </label>

  );

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


const h1:
  CSSProperties = {

    margin:
      "5px 0",

    fontSize:
      30
  };


const muted:
  CSSProperties = {

    margin:
      0,

    color:
      "#64748b"
  };


const toolbar:
  CSSProperties = {

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


const tableWrap:
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


const primary:
  CSSProperties = {

    border:
      0,

    borderRadius:
      9,

    background:
      "#2563eb",

    color:
      "white",

    height:
      42,

    padding:
      "0 15px",

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

    border:
      "1px solid #e2e8f0",

    borderRadius:
      9,

    background:
      "white",

    height:
      42,

    padding:
      "0 14px",

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

    color:
      "#334155"
  };


const smallButton:
  CSSProperties = {

    borderRadius:
      8,

    height:
      32,

    padding:
      "0 9px",

    display:
      "inline-flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    gap:
      5,

    cursor:
      "pointer",

    fontSize:
      11,

    fontWeight:
      700
  };


const errorBox:
  CSSProperties = {

    marginBottom:
      15,

    padding:
      12,

    borderRadius:
      10,

    background:
      "#fef2f2",

    color:
      "#b91c1c",

    border:
      "1px solid #fecaca",

    display:
      "flex",

    alignItems:
      "center"
  };


const successBox:
  CSSProperties = {

    marginBottom:
      15,

    padding:
      12,

    borderRadius:
      10,

    background:
      "#ecfdf5",

    color:
      "#047857",

    border:
      "1px solid #a7f3d0",

    display:
      "flex",

    alignItems:
      "center",

    gap:
      7
  };


const pagination:
  CSSProperties = {

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    padding:
      "14px 0"
  };


const labelStyle:
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


const two:
  CSSProperties = {

    display:
      "grid",

    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",

    gap:
      12
  };


const modalFoot:
  CSSProperties = {

    display:
      "flex",

    justifyContent:
      "flex-end",

    gap:
      8,

    paddingTop:
      15,

    borderTop:
      "1px solid #f1f5f9",

    marginTop:
      15
  };


const modalHead:
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


const close:
  CSSProperties = {

    border:
      0,

    background:
      "#f1f5f9",

    width:
      36,

    height:
      36,

    borderRadius:
      9,

    cursor:
      "pointer",

    display:
      "grid",

    placeItems:
      "center"
  };


const overlay:
  CSSProperties = {

    position:
      "fixed",

    inset:
      0,

    background:
      "rgba(15,23,42,.58)",

    zIndex:
      3000,

    overflowY:
      "auto",

    padding:
      "30px 20px",

    boxSizing:
      "border-box"
  };


const modalBox:
  CSSProperties = {

    width:
      "100%",

    maxWidth:
      650,

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
      "30px auto"
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


function badge(
  status:
    string
) {

  return {

    display:
      "inline-flex",

    padding:
      "5px 9px",

    borderRadius:
      999,

    background:
      status ===
      "active"
        ? "#ecfdf5"
        : "#fef2f2",

    color:
      status ===
      "active"
        ? "#047857"
        : "#b91c1c",

    fontSize:
      11,

    fontWeight:
      700

  };

}