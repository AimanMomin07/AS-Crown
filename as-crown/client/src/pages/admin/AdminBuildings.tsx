import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";



import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Users,
  Home,
  RefreshCw
} from "lucide-react";

import {
  getBuildings,
  createBuilding,
  updateBuilding,
  deleteBuilding
} from "../../api/buildings.api";

import {
  generateFlats
} from "../../api/flats.api";


/* =========================================================
   BACKEND BUILDING MODEL
========================================================= */

interface Building {

  id: number;

  name: string;

  building_code:
    string;

  total_floors:
    number;

  total_flats:
    number;

  address:
    string | null;

  status:
    "active"
    | "inactive";

  created_at?:
    string;

  updated_at?:
    string;

  active_flats?:
    number;

  occupied_flats?:
    number;

  vacant_flats?:
    number;

  rented_flats?:
    number;

  wings?:
    number;

}


/* =========================================================
   COMPONENT
========================================================= */

export default function AdminBuildings() {

  const [
    buildings,
    setBuildings
  ] =
    useState<Building[]>([]);


  const [
    search,
    setSearch
  ] =
    useState("");


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
    generatingId,
    setGeneratingId
  ] =
    useState<number | null>(
      null
    );


  const [
    deletingId,
    setDeletingId
  ] =
    useState<number | null>(
      null
    );


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
    showModal,
    setShowModal
  ] =
    useState(false);


  const [
    editingId,
    setEditingId
  ] =
    useState<number | null>(
      null
    );


  const [
    form,
    setForm
  ] =
    useState({

      name:
        "",

      code:
        "",

      address:
        "",

      floors:
        "10",

      flats:
        "40"

    });


  /* =======================================================
     LOAD BUILDINGS FROM DATABASE
  ======================================================= */

  const loadBuildings =
    useCallback(
      async () => {

        try {

          setLoading(true);

          setError("");

          const response =
            await getBuildings();


          const rows =
            response?.data?.buildings ||
            [];


          setBuildings(
            rows
          );

        } catch (
          requestError: any
        ) {

          console.error(
            "Load buildings error:",
            requestError
          );


          setError(
            requestError
              ?.response
              ?.data
              ?.message ||
            "Unable to load buildings from the server."
          );

        } finally {

          setLoading(false);

        }

      },
      []
    );


  useEffect(() => {

    void loadBuildings();

  }, [
    loadBuildings
  ]);


  /* =======================================================
     FILTER
  ======================================================= */

  const filteredBuildings =
    useMemo(() => {

      const value =
        search
          .trim()
          .toLowerCase();


      if (!value) {

        return buildings;

      }


      return buildings.filter(
        building =>

          building.name
            .toLowerCase()
            .includes(value) ||

          building.building_code
            .toLowerCase()
            .includes(value) ||

          (
            building.address ||
            ""
          )
            .toLowerCase()
            .includes(value)

      );

    }, [
      buildings,
      search
    ]);


  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalBuildings =
    buildings.length;


  const totalFlats =
    buildings.reduce(
      (
        total,
        building
      ) =>
        total +
        Number(
          building.total_flats ||
          0
        ),
      0
    );


  const occupiedFlats =
    buildings.reduce(
      (
        total,
        building
      ) =>
        total +
        Number(
          building.occupied_flats ||
          0
        ),
      0
    );


  const vacantFlats =
    buildings.reduce(
      (
        total,
        building
      ) =>
        total +
        Number(
          building.vacant_flats ||
          0
        ),
      0
    );


  /* =======================================================
     CREATE MODAL
  ======================================================= */

  function openCreate() {

    setEditingId(
      null
    );


    setForm({

      name:
        "",

      code:
        "",

      address:
        "",

      floors:
        "10",

      flats:
        "40"

    });


    setError("");

    setSuccess("");

    setShowModal(
      true
    );

  }


  /* =======================================================
     EDIT MODAL
  ======================================================= */

  function openEdit(
    building: Building
  ) {

    setEditingId(
      building.id
    );


    setForm({

      name:
        building.name,

      code:
        building.building_code,

      address:
        building.address ||
        "",

      floors:
        String(
          building.total_floors ||
          1
        ),

      flats:
        String(
          building.total_flats ||
          0
        )

    });


    setError("");

    setSuccess("");

    setShowModal(
      true
    );

  }


  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  function closeModal() {

    if (saving) {

      return;

    }


    setShowModal(
      false
    );


    setEditingId(
      null
    );

  }


  /* =======================================================
     SAVE BUILDING
  ======================================================= */

 async function saveBuilding(
  event: React.FormEvent
) {

    event.preventDefault();


    setError("");

    setSuccess("");


    const name =
      form.name.trim();


    const code =
      form.code
        .trim()
        .toUpperCase();


    const address =
      form.address.trim();


    const totalFloors =
      Number(
        form.floors
      );


    const totalFlats =
      Number(
        form.flats
      );


    if (!name) {

      setError(
        "Building name is required."
      );

      return;

    }


    if (!code) {

      setError(
        "Building code is required."
      );

      return;

    }


    if (
      !Number.isInteger(
        totalFloors
      ) ||
      totalFloors <= 0
    ) {

      setError(
        "Total floors must be a valid positive number."
      );

      return;

    }


    if (
      !Number.isInteger(
        totalFlats
      ) ||
      totalFlats < 0
    ) {

      setError(
        "Total flats must be a valid number."
      );

      return;

    }


    try {

      setSaving(
        true
      );


      if (
        editingId !== null
      ) {

        await updateBuilding(
          editingId,
          {
            name,
            buildingCode:
              code,
            totalFloors,
            totalFlats,
            address,
            status:
              "active"
          }
        );


        setSuccess(
          "Building updated successfully."
        );

      } else {

        await createBuilding(
          {
            name,
            buildingCode:
              code,
            totalFloors,
            totalFlats,
            address,
            status:
              "active"
          }
        );


        setSuccess(
          "Building created successfully."
        );

      }


      closeModal();


      await loadBuildings();

    } catch (
      requestError: any
    ) {

      console.error(
        "Save building error:",
        requestError
      );


      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
        "Unable to save building."
      );

    } finally {

      setSaving(
        false
      );

    }

  }


  /* =======================================================
     DELETE / DEACTIVATE
  ======================================================= */

  async function handleDelete(
    building: Building
  ) {

    const confirmed =
      window.confirm(
        `Are you sure you want to remove "${building.name}"?`
      );


    if (!confirmed) {

      return;

    }


    try {

      setDeletingId(
        building.id
      );

      setError("");

      setSuccess("");


      await deleteBuilding(
        building.id
      );


      setSuccess(
        "Building removed successfully."
      );


      await loadBuildings();

    } catch (
      requestError: any
    ) {

      console.error(
        "Delete building error:",
        requestError
      );


      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
        "Unable to remove building."
      );

    } finally {

      setDeletingId(
        null
      );

    }

  }


  /* =======================================================
     GENERATE FLATS
  ======================================================= */

  async function handleGenerateFlats(
    building: Building
  ) {

    if (
      building.total_flats <= 0
    ) {

      setError(
        "Set the building's total flats before generating flats."
      );

      return;

    }


    const flatsPerFloor =
      Math.ceil(
        building.total_flats /
        Math.max(
          building.total_floors,
          1
        )
      );


    const confirmed =
      window.confirm(
        `Generate flats for ${building.name}?\n\n` +
        `Floors: ${building.total_floors}\n` +
        `Target flats: ${building.total_flats}\n` +
        `Flats per floor: ${flatsPerFloor}`
      );


    if (!confirmed) {

      return;

    }


    try {

      setGeneratingId(
        building.id
      );

      setError("");

      setSuccess("");


      const response =
        await generateFlats(
          {
            buildingId:
              building.id,

            flatsPerFloor
          }
        );


      setSuccess(
        response?.message ||
        "Flats generated successfully."
      );


      await loadBuildings();

    } catch (
      requestError: any
    ) {

      console.error(
        "Generate flats error:",
        requestError
      );


      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
        "Unable to generate flats."
      );

    } finally {

      setGeneratingId(
        null
      );

    }

  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div
      style={{
        minHeight:
          "100vh",

        padding:
          "28px",

        background:
          "#f8fafc",

        boxSizing:
          "border-box"
      }}
    >

      <div
        style={{
          maxWidth:
            "1400px",

          margin:
            "0 auto"
        }}
      >


        {/* =================================================
            HEADER
        ================================================= */}

        <div
          style={{
            display:
              "flex",

            justifyContent:
              "space-between",

            alignItems:
              "center",

            gap:
              "20px",

            marginBottom:
              "25px",

            flexWrap:
              "wrap"
          }}
        >

          <div>

            <div
              style={{
                color:
                  "#2563eb",

                fontSize:
                  "12px",

                fontWeight:
                  700,

                letterSpacing:
                  "1.5px",

                textTransform:
                  "uppercase"
              }}
            >
              Property Management
            </div>


            <h1
              style={{
                margin:
                  "6px 0",

                fontSize:
                  "30px",

                color:
                  "#0f172a"
              }}
            >
              Buildings
            </h1>


            <p
              style={{
                margin:
                  0,

                color:
                  "#64748b"
              }}
            >
              Manage AS CROWN
              buildings and
              residential towers
              directly from the
              database.
            </p>

          </div>


          <div
            style={{
              display:
                "flex",

              gap:
                "9px",

              alignItems:
                "center"
            }}
          >

            <button
              onClick={() =>
                void loadBuildings()
              }

              disabled={
                loading
              }

              style={{
                border:
                  "1px solid #e2e8f0",

                background:
                  "white",

                color:
                  "#334155",

                padding:
                  "11px 15px",

                borderRadius:
                  "10px",

                display:
                  "flex",

                alignItems:
                  "center",

                gap:
                  "7px",

                cursor:
                  loading
                    ? "not-allowed"
                    : "pointer"
              }}
            >

              <RefreshCw
                size={17}
              />

              Refresh

            </button>


            <button
              onClick={
                openCreate
              }

              style={{
                border:
                  0,

                background:
                  "#2563eb",

                color:
                  "white",

                padding:
                  "12px 18px",

                borderRadius:
                  "10px",

                display:
                  "flex",

                alignItems:
                  "center",

                gap:
                  "8px",

                cursor:
                  "pointer",

                fontWeight:
                  600
              }}
            >

              <Plus
                size={18}
              />

              Add Building

            </button>

          </div>

        </div>


        {/* =================================================
            MESSAGES
        ================================================= */}

        {error && (

          <div
            style={{
              marginBottom:
                "15px",

              padding:
                "13px 15px",

              background:
                "#fef2f2",

              color:
                "#b91c1c",

              border:
                "1px solid #fecaca",

              borderRadius:
                "10px"
            }}
          >
            {error}
          </div>

        )}


        {success && (

          <div
            style={{
              marginBottom:
                "15px",

              padding:
                "13px 15px",

              background:
                "#ecfdf5",

              color:
                "#047857",

              border:
                "1px solid #a7f3d0",

              borderRadius:
                "10px"
            }}
          >
            {success}
          </div>

        )}


        {/* =================================================
            STATISTICS
        ================================================= */}

        <div
          style={{
            display:
              "grid",

            gridTemplateColumns:
              "repeat(auto-fit,minmax(210px,1fr))",

            gap:
              "16px",

            marginBottom:
              "22px"
          }}
        >

          <StatCard
            title="Buildings"
            value={
              totalBuildings
            }
            icon={
              <Building2
                size={21}
              />
            }
          />


          <StatCard
            title="Total Flats"
            value={
              totalFlats
            }
            icon={
              <Home
                size={21}
              />
            }
          />


          <StatCard
            title="Occupied"
            value={
              occupiedFlats
            }
            icon={
              <Users
                size={21}
              />
            }
          />


          <StatCard
            title="Vacant"
            value={
              vacantFlats
            }
            icon={
              <Home
                size={21}
              />
            }
          />

        </div>


        {/* =================================================
            SEARCH
        ================================================= */}

        <div
          style={{
            background:
              "white",

            border:
              "1px solid #e2e8f0",

            borderRadius:
              "14px",

            padding:
              "15px",

            marginBottom:
              "18px"
          }}
        >

          <div
            style={{
              position:
                "relative"
            }}
          >

            <Search
              size={18}

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
                event =>
                  setSearch(
                    event.target.value
                  )
              }

              placeholder=
                "Search building..."

              style={{
                width:
                  "100%",

                boxSizing:
                  "border-box",

                height:
                  "45px",

                padding:
                  "0 15px 0 42px",

                border:
                  "1px solid #e2e8f0",

                borderRadius:
                  "10px",

                outline:
                  "none",

                fontSize:
                  "14px"
              }}

            />

          </div>

        </div>


        {/* =================================================
            BUILDINGS
        ================================================= */}

        {loading ? (

          <div
            style={{
              minHeight:
                "250px",

              display:
                "grid",

              placeItems:
                "center",

              background:
                "white",

              border:
                "1px solid #e2e8f0",

              borderRadius:
                "16px",

              color:
                "#64748b"
            }}
          >

            <div
              style={{
                display:
                  "flex",

                alignItems:
                  "center",

                gap:
                  "10px"
              }}
            >

              <RefreshCw
                size={20}
                className=
                  "as-crown-spin"
              />

              Loading buildings...

            </div>


            <style>
              {`
                .as-crown-spin {
                  animation:
                    asCrownSpin
                    1s linear infinite;
                }

                @keyframes asCrownSpin {
                  from {
                    transform:
                      rotate(0deg);
                  }
                  to {
                    transform:
                      rotate(360deg);
                  }
                }
              `}
            </style>

          </div>

        ) : filteredBuildings.length === 0 ? (

          <div
            style={{
              background:
                "white",

              border:
                "1px solid #e2e8f0",

              borderRadius:
                "16px",

              padding:
                "60px",

              textAlign:
                "center"
            }}
          >

            <Building2
              size={40}
              color="#cbd5e1"
            />

            <h3>
              No buildings found
            </h3>

            <p
              style={{
                color:
                  "#94a3b8"
              }}
            >
              {search
                ? "Try a different search."
                : "Create your first AS CROWN building."}
            </p>

          </div>

        ) : (

          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "repeat(auto-fit,minmax(330px,1fr))",

              gap:
                "18px"
            }}
          >

            {filteredBuildings.map(
              building => (

                <div
                  key={
                    building.id
                  }

                  style={{
                    background:
                      "white",

                    border:
                      "1px solid #e2e8f0",

                    borderRadius:
                      "16px",

                    padding:
                      "20px",

                    boxShadow:
                      "0 4px 15px rgba(15,23,42,.04)"
                  }}
                >


                  {/* TOP */}

                  <div
                    style={{
                      display:
                        "flex",

                      justifyContent:
                        "space-between",

                      gap:
                        "12px"
                    }}
                  >

                    <div
                      style={{
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
                            "48px",

                          height:
                            "48px",

                          borderRadius:
                            "12px",

                          background:
                            "#eff6ff",

                          color:
                            "#2563eb",

                          display:
                            "flex",

                          alignItems:
                            "center",

                          justifyContent:
                            "center"
                        }}
                      >

                        <Building2
                          size={23}
                        />

                      </div>


                      <div>

                        <h3
                          style={{
                            margin:
                              0,

                            color:
                              "#0f172a",

                            fontSize:
                              "17px"
                          }}
                        >

                          {
                            building.name
                          }

                        </h3>


                        <p
                          style={{
                            margin:
                              "4px 0 0",

                            color:
                              "#94a3b8",

                            fontSize:
                              "12px"
                          }}
                        >

                          Code:{" "}

                          {
                            building.building_code
                          }

                        </p>

                      </div>

                    </div>


                    <span
                      style={{
                        height:
                          "fit-content",

                        padding:
                          "5px 9px",

                        borderRadius:
                          "999px",

                        background:
                          building.status ===
                          "active"
                            ? "#ecfdf5"
                            : "#fef2f2",

                        color:
                          building.status ===
                          "active"
                            ? "#047857"
                            : "#b91c1c",

                        fontSize:
                          "11px",

                        fontWeight:
                          700
                      }}
                    >
                      {
                        building.status
                      }
                    </span>

                  </div>


                  {/* ADDRESS */}

                  <p
                    style={{
                      color:
                        "#64748b",

                      fontSize:
                        "13px",

                      margin:
                        "18px 0"
                    }}
                  >
                    {
                      building.address ||
                      "No address provided"
                    }
                  </p>


                  {/* STATS */}

                  <div
                    style={{
                      display:
                        "grid",

                      gridTemplateColumns:
                        "repeat(3,1fr)",

                      gap:
                        "8px"
                    }}
                  >

                    <MiniStat
                      label="Floors"
                      value={
                        Number(
                          building.total_floors ||
                          0
                        )
                      }
                    />


                    <MiniStat
                      label="Flats"
                      value={
                        Number(
                          building.total_flats ||
                          0
                        )
                      }
                    />


                    <MiniStat
                      label="Occupied"
                      value={
                        Number(
                          building.occupied_flats ||
                          0
                        )
                      }
                    />

                  </div>


                  {/* VACANT */}

                  <div
                    style={{
                      marginTop:
                        "10px",

                      display:
                        "flex",

                      justifyContent:
                        "space-between",

                      padding:
                        "10px 12px",

                      background:
                        "#f8fafc",

                      borderRadius:
                        "9px",

                      fontSize:
                        "12px"
                    }}
                  >

                    <span
                      style={{
                        color:
                          "#64748b"
                      }}
                    >
                      Vacant
                    </span>

                    <strong>
                      {
                        Number(
                          building.vacant_flats ||
                          0
                        )
                      }
                    </strong>

                  </div>


                  {/* ACTIONS */}

                  <div
                    style={{
                      display:
                        "grid",

                      gridTemplateColumns:
                        "1fr 1fr",

                      gap:
                        "8px",

                      marginTop:
                        "18px",

                      paddingTop:
                        "15px",

                      borderTop:
                        "1px solid #f1f5f9"
                    }}
                  >

                    <button
                      onClick={() =>
                        openEdit(
                          building
                        )
                      }

                      style={{
                        height:
                          "38px",

                        border:
                          "1px solid #e2e8f0",

                        background:
                          "white",

                        borderRadius:
                          "9px",

                        display:
                          "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "center",

                        gap:
                          "6px",

                        cursor:
                          "pointer"
                      }}
                    >

                      <Pencil
                        size={15}
                      />

                      Edit

                    </button>


                    <button
                      onClick={() =>
                        void handleDelete(
                          building
                        )
                      }

                      disabled={
                        deletingId ===
                        building.id
                      }

                      style={{
                        height:
                          "38px",

                        border:
                          "1px solid #fee2e2",

                        background:
                          "#fffafa",

                        color:
                          "#dc2626",

                        borderRadius:
                          "9px",

                        display:
                          "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "center",

                        gap:
                          "6px",

                        cursor:
                          deletingId ===
                          building.id
                            ? "not-allowed"
                            : "pointer"
                      }}
                    >

                      <Trash2
                        size={15}
                      />

                      {
                        deletingId ===
                        building.id
                          ? "Removing..."
                          : "Remove"
                      }

                    </button>

                  </div>


                  {/* GENERATE FLATS */}

                  <button
                    onClick={() =>
                      void handleGenerateFlats(
                        building
                      )
                    }

                    disabled={
                      generatingId ===
                      building.id
                    }

                    style={{
                      width:
                        "100%",

                      height:
                        "40px",

                      marginTop:
                        "9px",

                      border:
                        0,

                      background:
                        generatingId ===
                        building.id
                          ? "#94a3b8"
                          : "#0f172a",

                      color:
                        "white",

                      borderRadius:
                        "9px",

                      cursor:
                        generatingId ===
                        building.id
                          ? "not-allowed"
                          : "pointer",

                      fontWeight:
                        600
                    }}
                  >

                    {
                      generatingId ===
                      building.id
                        ? "Generating flats..."
                        : "Generate / Sync Flats"
                    }

                  </button>

                </div>

              )
            )}

          </div>

        )}


        {/* =================================================
            MODAL
        ================================================= */}

        {showModal && (

          <div
            style={{
              position:
                "fixed",

              inset:
                0,

              background:
                "rgba(15,23,42,.55)",

              display:
                "grid",

              placeItems:
                "center",

              zIndex:
                2000,

              padding:
                "20px"
            }}
          >

            <form
              onSubmit={
                saveBuilding
              }

              style={{
                width:
                  "100%",

                maxWidth:
                  "560px",

                maxHeight:
                  "calc(100vh - 40px)",

                overflowY:
                  "auto",

                background:
                  "white",

                borderRadius:
                  "18px",

                padding:
                  "25px",

                boxSizing:
                  "border-box",

                boxShadow:
                  "0 25px 70px rgba(0,0,0,.2)"
              }}
            >

              <div
                style={{
                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  alignItems:
                    "center",

                  marginBottom:
                    "20px"
                }}
              >

                <div>

                  <h2
                    style={{
                      margin:
                        0
                    }}
                  >

                    {
                      editingId !==
                      null
                        ? "Edit Building"
                        : "Add Building"
                    }

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
                    Changes are saved directly to MySQL.
                  </p>

                </div>


                <button
                  type="button"

                  onClick={
                    closeModal
                  }

                  style={{
                    border:
                      0,

                    background:
                      "#f1f5f9",

                    borderRadius:
                      "9px",

                    width:
                      "36px",

                    height:
                      "36px",

                    cursor:
                      "pointer",

                    display:
                      "grid",

                    placeItems:
                      "center"
                  }}
                >

                  <X
                    size={18}
                  />

                </button>

              </div>


              <Field
                label="Building Name"
                value={
                  form.name
                }

                onChange={
                  value =>
                    setForm(
                      current => ({
                        ...current,
                        name:
                          value
                      })
                    )
                }

                placeholder=
                  "Example: AS CROWN Tower A"

              />


              <Field
                label="Building Code"
                value={
                  form.code
                }

                onChange={
                  value =>
                    setForm(
                      current => ({
                        ...current,
                        code:
                          value
                      })
                    )
                }

                placeholder=
                  "Example: A"

              />


              <Field
                label="Address"
                value={
                  form.address
                }

                onChange={
                  value =>
                    setForm(
                      current => ({
                        ...current,
                        address:
                          value
                      })
                    )
                }

                placeholder=
                  "AS CROWN Society"

              />


              <div
                style={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    "1fr 1fr",

                  gap:
                    "12px"
                }}
              >

                <Field
                  label="Total Floors"
                  value={
                    form.floors
                  }

                  onChange={
                    value =>
                      setForm(
                        current => ({
                          ...current,
                          floors:
                            value
                        })
                      )
                  }

                  type="number"
                />


                <Field
                  label="Target Total Flats"
                  value={
                    form.flats
                  }

                  onChange={
                    value =>
                      setForm(
                        current => ({
                          ...current,
                          flats:
                            value
                        })
                      )
                  }

                  type="number"
                />

              </div>


              <div
                style={{
                  background:
                    "#eff6ff",

                  borderRadius:
                    "10px",

                  padding:
                    "12px",

                  marginTop:
                    "2px",

                  fontSize:
                    "12px",

                  color:
                    "#1e3a8a"
                }}
              >
                After creating or updating the
                building, use
                <strong>
                  {" Generate / Sync Flats "}
                </strong>
                on the building card to create
                its flats in the database.
              </div>


              <div
                style={{
                  display:
                    "flex",

                  justifyContent:
                    "flex-end",

                  gap:
                    "10px",

                  marginTop:
                    "20px",

                  paddingTop:
                    "15px",

                  borderTop:
                    "1px solid #f1f5f9"
                }}
              >

                <button
                  type="button"

                  onClick={
                    closeModal
                  }

                  disabled={
                    saving
                  }

                  style={{
                    padding:
                      "11px 18px",

                    border:
                      "1px solid #e2e8f0",

                    background:
                      "white",

                    borderRadius:
                      "9px",

                    cursor:
                      saving
                        ? "not-allowed"
                        : "pointer"
                  }}
                >
                  Cancel
                </button>


                <button
                  type="submit"

                  disabled={
                    saving
                  }

                  style={{
                    padding:
                      "11px 20px",

                    border:
                      0,

                    background:
                      saving
                        ? "#94a3b8"
                        : "#2563eb",

                    color:
                      "white",

                    borderRadius:
                      "9px",

                    cursor:
                      saving
                        ? "not-allowed"
                        : "pointer",

                    fontWeight:
                      600
                  }}
                >

                  {
                    saving
                      ? "Saving..."
                      : editingId !==
                        null
                        ? "Save Changes"
                        : "Create Building"
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
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon
}: {
  title:
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
          "18px",

        display:
          "flex",

        alignItems:
          "center",

        gap:
          "14px"
      }}
    >

      <div
        style={{
          width:
            "45px",

          height:
            "45px",

          borderRadius:
            "12px",

          background:
            "#eff6ff",

          color:
            "#2563eb",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center"
        }}
      >
        {icon}
      </div>


      <div>

        <div
          style={{
            color:
              "#64748b",

            fontSize:
              "12px"
          }}
        >
          {title}
        </div>


        <strong
          style={{
            display:
              "block",

            marginTop:
              "3px",

            fontSize:
              "22px",

            color:
              "#0f172a"
          }}
        >
          {value}
        </strong>

      </div>

    </div>

  );

}


/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  label,
  value
}: {
  label:
    string;

  value:
    number;
}) {

  return (

    <div
      style={{
        background:
          "#f8fafc",

        borderRadius:
          "9px",

        padding:
          "9px",

        textAlign:
          "center"
      }}
    >

      <strong
        style={{
          display:
            "block",

          color:
            "#0f172a"
        }}
      >
        {value}
      </strong>


      <span
        style={{
          fontSize:
            "10px",

          color:
            "#94a3b8"
        }}
      >
        {label}
      </span>

    </div>

  );

}


/* =========================================================
   FORM FIELD
========================================================= */

function Field({
  label,
  value,
  onChange,
  placeholder,
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

  placeholder?:
    string;

  type?:
    string;
}) {

  return (

    <label
      style={{
        display:
          "block",

        marginBottom:
          "14px"
      }}
    >

      <span
        style={{
          display:
            "block",

          marginBottom:
            "6px",

          fontSize:
            "13px",

          fontWeight:
            600,

          color:
            "#334155"
        }}
      >
        {label}
      </span>


      <input
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

        placeholder={
          placeholder
        }

        min={
          type ===
          "number"
            ? "0"
            : undefined
        }

        style={{
          width:
            "100%",

          height:
            "42px",

          boxSizing:
            "border-box",

          padding:
            "0 12px",

          border:
            "1px solid #e2e8f0",

          borderRadius:
            "9px",

          outline:
            "none"
        }}
      />

    </label>

  );

}