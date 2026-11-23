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
  RefreshCw,
  Search,
  X,
  Save
} from "lucide-react";

import {
  getVehicles,
  createVehicle
} from "../../api/society.api";

import {
  getAdminUsers
} from "../../api/admin.api";

import {
  getFlats
} from "../../api/flats.api";


interface Vehicle {

  id:
    number;

  vehicle_number:
    string;

  vehicle_type:
    string;

  brand?:
    string | null;

  model?:
    string | null;

  color?:
    string | null;

  parking_slot?:
    string | null;

  first_name:
    string;

  last_name?:
    string | null;

  flat_number?:
    string | null;

  status:
    string;

}


interface Resident {

  id:
    number;

  first_name:
    string;

  last_name?:
    string | null;

  email?:
    string | null;

}


interface Flat {

  id:
    number;

  flat_number:
    string;

  building_name?:
    string;

}


export default function AdminVehicles() {

  const [
    vehicles,
    setVehicles
  ] =
    useState<Vehicle[]>([]);


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
    useState({

      userId:
        "",

      flatId:
        "",

      vehicleNumber:
        "",

      vehicleType:
        "car",

      brand:
        "",

      model:
        "",

      color:
        "",

      parkingSlot:
        ""

    });


  const loadVehicles =
    useCallback(
      async () => {

        try {

          setLoading(
            true
          );

          setError("");


          const response =
            await getVehicles({
              search:
                search ||
                undefined
            });


          setVehicles(
            response?.data?.vehicles ||
            []
          );

        } catch (
          requestError: any
        ) {

          console.error(
            requestError
          );

          setError(
            requestError
              ?.response
              ?.data
              ?.message ||
            "Unable to load vehicles."
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


  async function loadResidents() {

    try {

      const response =
        await getAdminUsers({
          role:
            "resident",
          status:
            "active",
          limit:
            200
        });


      setResidents(
        response?.data?.users ||
        []
      );

    } catch (
      requestError
    ) {

      console.error(
        requestError
      );

    }

  }


  async function loadFlats() {

    try {

      const response =
        await getFlats();


      setFlats(
        response?.data?.flats ||
        []
      );

    } catch (
      requestError
    ) {

      console.error(
        requestError
      );

    }

  }


  useEffect(() => {

    void loadVehicles();

  }, [
    loadVehicles
  ]);


  useEffect(() => {

    void loadResidents();

    void loadFlats();

  }, []);


  function openCreate() {

    setForm({

      userId:
        "",

      flatId:
        "",

      vehicleNumber:
        "",

      vehicleType:
        "car",

      brand:
        "",

      model:
        "",

      color:
        "",

      parkingSlot:
        ""

    });

    setError("");

    setSuccess("");

    setShowModal(
      true
    );

  }


  async function handleSubmit(
    event: FormEvent
  ) {

    event.preventDefault();

    setError("");

    setSuccess("");


    if (
      !form.userId
    ) {

      setError(
        "Select a resident."
      );

      return;

    }


    if (
      !form.vehicleNumber.trim()
    ) {

      setError(
        "Vehicle number is required."
      );

      return;

    }


    try {

      setSaving(
        true
      );


      await createVehicle({

        userId:
          Number(
            form.userId
          ),

        flatId:
          form.flatId
            ? Number(
                form.flatId
              )
            : null,

        vehicleNumber:
          form.vehicleNumber
            .trim()
            .toUpperCase(),

        vehicleType:
          form.vehicleType,

        brand:
          form.brand.trim() ||
          null,

        model:
          form.model.trim() ||
          null,

        color:
          form.color.trim() ||
          null,

        parkingSlot:
          form.parkingSlot.trim() ||
          null

      });


      setShowModal(
        false
      );


      setSuccess(
        "Vehicle registered successfully."
      );


      await loadVehicles();

    } catch (
      requestError: any
    ) {

      console.error(
        "Vehicle registration error:",
        requestError
      );


      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
        "Unable to register vehicle."
      );

    } finally {

      setSaving(
        false
      );

    }

  }


  return (

    <div
      style={{
        minHeight:
          "100vh",
        background:
          "#f8fafc",
        padding:
          28
      }}
    >

      <div
        style={{
          maxWidth:
            1400,
          margin:
            "0 auto"
        }}
      >

        <div
          style={header}
        >

          <div>

            <div
              style={eyebrow}
            >
              COMMUNITY
            </div>

            <h1
              style={title}
            >
              Vehicles
            </h1>

            <p
              style={description}
            >
              Manage resident vehicles and parking information.
            </p>

          </div>


          <div
            style={{
              display:
                "flex",
              gap:
                9
            }}
          >

            <button
              onClick={() =>
                void loadVehicles()
              }
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
              Register Vehicle
            </button>

          </div>

        </div>


        {error && (
          <Message
            type="error"
            text={error}
          />
        )}


        {success && (
          <Message
            type="success"
            text={success}
          />
        )}


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
              16
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
                "Search vehicle or resident"
              style={{
                ...input,
                paddingLeft:
                  40
              }}
            />

          </div>

        </div>


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
                tableStyle
              }
            >

              <thead>

                <tr>

                  <th style={th}>
                    Vehicle
                  </th>

                  <th style={th}>
                    Resident
                  </th>

                  <th style={th}>
                    Flat
                  </th>

                  <th style={th}>
                    Parking
                  </th>

                  <th style={th}>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan={5}
                      style={
                        empty
                      }
                    >
                      Loading vehicles...
                    </td>

                  </tr>

                ) : vehicles.length === 0 ? (

                  <tr>

                    <td
                      colSpan={5}
                      style={
                        empty
                      }
                    >
                      No vehicles registered.
                    </td>

                  </tr>

                ) : (

                  vehicles.map(
                    vehicle => (

                      <tr
                        key={
                          vehicle.id
                        }
                        style={
                          row
                        }
                      >

                        <td style={td}>

                          <strong>
                            {
                              vehicle.vehicle_number
                            }
                          </strong>

                          <div
                            style={
                              small
                            }
                          >
                            {
                              vehicle.vehicle_type
                            }{" "}
                            {vehicle.brand ||
                              ""}{" "}
                            {vehicle.model ||
                              ""}
                          </div>

                        </td>


                        <td style={td}>

                          {
                            vehicle.first_name
                          }{" "}
                          {
                            vehicle.last_name ||
                            ""
                          }

                        </td>


                        <td style={td}>
                          {
                            vehicle.flat_number ||
                            "—"
                          }
                        </td>


                        <td style={td}>
                          {
                            vehicle.parking_slot ||
                            "—"
                          }
                        </td>


                        <td style={td}>

                          <span
                            style={
                              badge
                            }
                          >
                            {
                              vehicle.status
                            }
                          </span>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>


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
                    PARKING
                  </div>

                  <h2
                    style={{
                      margin:
                        "4px 0"
                    }}
                  >
                    Register Vehicle
                  </h2>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
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


              <label
                style={
                  labelStyle
                }
              >
                <span>
                  Resident
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
                  required
                  style={
                    input
                  }
                >

                  <option value="">
                    Select resident
                  </option>

                  {residents.map(
                    resident => (

                      <option
                        key={
                          resident.id
                        }
                        value={
                          resident.id
                        }
                      >
                        {
                          resident.first_name
                        }{" "}
                        {
                          resident.last_name ||
                          ""
                        }{" "}
                        —{" "}
                        {
                          resident.email ||
                          `ID ${resident.id}`
                        }
                      </option>

                    )
                  )}

                </select>

              </label>


              <label
                style={
                  labelStyle
                }
              >
                <span>
                  Flat
                </span>

                <select
                  value={
                    form.flatId
                  }
                  onChange={
                    event =>
                      setForm(
                        current => ({
                          ...current,
                          flatId:
                            event.target.value
                        })
                      )
                  }
                  style={
                    input
                  }
                >

                  <option value="">
                    Optional
                  </option>

                  {flats.map(
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
                          flat.flat_number
                        }{" "}
                        {
                          flat.building_name
                            ? `— ${flat.building_name}`
                            : ""
                        }
                      </option>

                    )
                  )}

                </select>

              </label>


              <div
                style={
                  two
                }
              >

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
                  required
                />


                <label
                  style={
                    labelStyle
                  }
                >
                  <span>
                    Type
                  </span>

                  <select
                    value={
                      form.vehicleType
                    }
                    onChange={
                      event =>
                        setForm(
                          current => ({
                            ...current,
                            vehicleType:
                              event.target.value
                          })
                        )
                    }
                    style={
                      input
                    }
                  >

                    <option value="car">
                      Car
                    </option>

                    <option value="bike">
                      Bike
                    </option>

                    <option value="scooter">
                      Scooter
                    </option>

                    <option value="bicycle">
                      Bicycle
                    </option>

                    <option value="other">
                      Other
                    </option>

                  </select>

                </label>

              </div>


              <div
                style={
                  two
                }
              >

                <Field
                  label="Brand"
                  value={
                    form.brand
                  }
                  onChange={
                    value =>
                      setForm(
                        current => ({
                          ...current,
                          brand:
                            value
                        })
                      )
                  }
                />


                <Field
                  label="Model"
                  value={
                    form.model
                  }
                  onChange={
                    value =>
                      setForm(
                        current => ({
                          ...current,
                          model:
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
                  label="Color"
                  value={
                    form.color
                  }
                  onChange={
                    value =>
                      setForm(
                        current => ({
                          ...current,
                          color:
                            value
                        })
                      )
                  }
                />


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
                />

              </div>


              <div
                style={
                  modalFooter
                }
              >

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
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
                  <Save
                    size={16}
                  />

                  {
                    saving
                      ? "Saving..."
                      : "Register Vehicle"
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
        labelStyle
      }
    >

      <span>
        {label}
      </span>


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


function Message({
  type,
  text
}: {
  type:
    "error"
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
          type === "error"
            ? "#fef2f2"
            : "#ecfdf5",
        color:
          type === "error"
            ? "#b91c1c"
            : "#047857"
      }}
    >
      {text}
    </div>

  );

}


const header:
  React.CSSProperties = {
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    gap:
      15,
    marginBottom:
      22,
    flexWrap:
      "wrap"
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
      30
  };


const description:
  React.CSSProperties = {
    margin:
      0,
    color:
      "#64748b"
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
    marginTop:
      6
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
      700
  };


const primary:
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
    gap:
      7,
    cursor:
      "pointer",
    fontWeight:
      700
  };


const secondary:
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
    display:
      "inline-flex",
    alignItems:
      "center",
    gap:
      7,
    cursor:
      "pointer"
  };


const tableWrap:
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


const tableStyle:
  React.CSSProperties = {
    width:
      "100%",
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
      "uppercase"
  };


const td:
  React.CSSProperties = {
    padding:
      "14px 16px",
    fontSize:
      13
  };


const row:
  React.CSSProperties = {
    borderTop:
      "1px solid #f1f5f9"
  };


const small:
  React.CSSProperties = {
    color:
      "#94a3b8",
    fontSize:
      11,
    marginTop:
      3
  };


const empty:
  React.CSSProperties = {
    textAlign:
      "center",
    padding:
      50,
    color:
      "#94a3b8"
  };


const badge:
  React.CSSProperties = {
    display:
      "inline-flex",
    padding:
      "5px 9px",
    borderRadius:
      999,
    background:
      "#ecfdf5",
    color:
      "#047857",
    fontSize:
      11,
    fontWeight:
      700
  };


const two:
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
      2000,
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
      25
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
      10
  };


const closeButton:
  React.CSSProperties = {
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