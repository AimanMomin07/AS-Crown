import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  Building2,
  Search,
  RefreshCw
} from "lucide-react";

import {
  getFlats
} from "../../api/flats.api";

interface Flat {
  id: number;
  building_id: number;
  flat_number: string;
  floor_number: number;
  flat_type: string | null;
  area_sqft: number | null;
  owner_id: number | null;
  tenant_id: number | null;
  occupancy_status:
    | "occupied"
    | "vacant"
    | "rented"
    | "maintenance";
  status:
    | "active"
    | "inactive";

  building_name?: string;
  building_code?: string;

  owner_first_name?: string;
  owner_last_name?: string;
}

export default function AdminFlats() {

  const [
    flats,
    setFlats
  ] = useState<Flat[]>([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  const [
    search,
    setSearch
  ] = useState("");

  const [
    occupancy,
    setOccupancy
  ] = useState("");

  const loadFlats =
    useCallback(
      async () => {
        try {

          setLoading(true);
          setError("");

          const response =
            await getFlats({
              search:
                search || undefined,
              occupancyStatus:
                occupancy || undefined
            });

          setFlats(
            response?.data?.flats ||
            []
          );

        } catch (
          error: unknown
        ) {

          console.error(
            "Flats error:",
            error
          );

          setError(
            "Unable to load flats"
          );

        } finally {

          setLoading(false);

        }
      },
      [
        search,
        occupancy
      ]
    );

  useEffect(() => {
    void loadFlats();
  }, [loadFlats]);

  const occupied =
    flats.filter(
      flat =>
        flat.occupancy_status ===
        "occupied"
    ).length;

  const vacant =
    flats.filter(
      flat =>
        flat.occupancy_status ===
        "vacant"
    ).length;

  const rented =
    flats.filter(
      flat =>
        flat.occupancy_status ===
        "rented"
    ).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "28px"
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto"
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            marginBottom:
              "22px",
            flexWrap:
              "wrap",
            gap:
              "15px"
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color:
                  "#2563eb",
                fontSize:
                  "11px",
                fontWeight:
                  800,
                letterSpacing:
                  "1.5px"
              }}
            >
              PROPERTY MANAGEMENT
            </p>

            <h1
              style={{
                margin:
                  "5px 0",
                color:
                  "#0f172a"
              }}
            >
              Flats
            </h1>

            <p
              style={{
                margin: 0,
                color:
                  "#64748b"
              }}
            >
              Live AS CROWN flat inventory.
            </p>
          </div>

          <button
            onClick={() =>
              void loadFlats()
            }
            style={{
              border:
                "1px solid #e2e8f0",
              background:
                "white",
              padding:
                "10px 14px",
              borderRadius:
                "10px",
              display:
                "flex",
              alignItems:
                "center",
              gap:
                "8px",
              cursor:
                "pointer"
            }}
          >
            <RefreshCw
              size={16}
            />

            Refresh
          </button>
        </div>

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(200px,1fr))",
            gap:
              "15px",
            marginBottom:
              "18px"
          }}
        >
          <Card
            title="Total"
            value={flats.length}
          />

          <Card
            title="Occupied"
            value={occupied}
          />

          <Card
            title="Vacant"
            value={vacant}
          />

          <Card
            title="Rented"
            value={rented}
          />
        </div>

        <div
          style={{
            background:
              "white",
            border:
              "1px solid #e2e8f0",
            borderRadius:
              "15px",
            padding:
              "15px",
            marginBottom:
              "18px"
          }}
        >
          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "2fr 1fr auto",
              gap:
                "10px"
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
                value={search}
                onChange={event =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder=
                  "Search flat, building or resident"
                style={{
                  width:
                    "100%",
                  height:
                    "44px",
                  boxSizing:
                    "border-box",
                  padding:
                    "0 12px 0 40px",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius:
                    "10px"
                }}
              />
            </div>

            <select
              value={occupancy}
              onChange={event =>
                setOccupancy(
                  event.target.value
                )
              }
              style={selectStyle}
            >
              <option value="">
                All occupancy
              </option>

              <option value="vacant">
                Vacant
              </option>

              <option value="occupied">
                Occupied
              </option>

              <option value="rented">
                Rented
              </option>

              <option value="maintenance">
                Maintenance
              </option>
            </select>

            <button
              onClick={() =>
                void loadFlats()
              }
              style={{
                border: 0,
                background:
                  "#0f172a",
                color:
                  "white",
                padding:
                  "0 17px",
                borderRadius:
                  "10px",
                cursor:
                  "pointer"
              }}
            >
              Search
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding:
                "12px 15px",
              border:
                "1px solid #fecaca",
              background:
                "#fef2f2",
              color:
                "#b91c1c",
              borderRadius:
                "10px",
              marginBottom:
                "15px"
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            background:
              "white",
            border:
              "1px solid #e2e8f0",
            borderRadius:
              "16px",
            overflow:
              "hidden"
          }}
        >
          <div
            style={{
              overflowX:
                "auto"
            }}
          >
            <table
              style={{
                width:
                  "100%",
                borderCollapse:
                  "collapse"
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#f8fafc"
                  }}
                >
                  <th style={th}>
                    Flat
                  </th>

                  <th style={th}>
                    Building
                  </th>

                  <th style={th}>
                    Floor
                  </th>

                  <th style={th}>
                    Type
                  </th>

                  <th style={th}>
                    Resident
                  </th>

                  <th style={th}>
                    Occupancy
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign:
                          "center",
                        padding:
                          "50px"
                      }}
                    >
                      Loading flats...
                    </td>
                  </tr>
                ) : flats.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign:
                          "center",
                        padding:
                          "50px",
                        color:
                          "#64748b"
                      }}
                    >
                      No flats found.
                    </td>
                  </tr>
                ) : (
                  flats.map(flat => (
                    <tr
                      key={flat.id}
                      style={{
                        borderTop:
                          "1px solid #f1f5f9"
                      }}
                    >
                      <td style={cell}>
                        <strong>
                          {
                            flat.flat_number
                          }
                        </strong>
                      </td>

                      <td style={cell}>
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap:
                              "7px"
                          }}
                        >
                          <Building2
                            size={15}
                          />

                          {
                            flat.building_name
                          }

                          {" "}

                          <small>
                            (
                            {
                              flat.building_code
                            }
                            )
                          </small>
                        </div>
                      </td>

                      <td style={cell}>
                        {flat.floor_number}
                      </td>

                      <td style={cell}>
                        {flat.flat_type ||
                          "—"}
                      </td>

                      <td style={cell}>
                        {flat.owner_first_name
                          ? `${flat.owner_first_name} ${flat.owner_last_name || ""}`
                          : "Unassigned"}
                      </td>

                      <td style={cell}>
                        <span
                          style={{
                            padding:
                              "5px 9px",
                            borderRadius:
                              "999px",
                            background:
                              flat.occupancy_status ===
                              "vacant"
                                ? "#fffbeb"
                                : "#ecfdf5",
                            color:
                              flat.occupancy_status ===
                              "vacant"
                                ? "#b45309"
                                : "#047857",
                            fontSize:
                              "11px",
                            fontWeight:
                              700
                          }}
                        >
                          {
                            flat.occupancy_status
                          }
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  value
}: {
  title: string;
  value: number;
}) {
  return (
    <div
      style={{
        background:
          "white",
        border:
          "1px solid #e2e8f0",
        borderRadius:
          "15px",
        padding:
          "18px"
      }}
    >
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
            "5px",
          fontSize:
            "25px",
          color:
            "#0f172a"
        }}
      >
        {value}
      </strong>
    </div>
  );
}

const th:
  React.CSSProperties = {
    textAlign:
      "left",
    padding:
      "13px 16px",
    fontSize:
      "11px",
    textTransform:
      "uppercase",
    color:
      "#64748b"
  };

const cell:
  React.CSSProperties = {
    padding:
      "14px 16px",
    fontSize:
      "13px",
    color:
      "#475569"
  };

const selectStyle:
  React.CSSProperties = {
    width:
      "100%",
    height:
      "44px",
    border:
      "1px solid #e2e8f0",
    borderRadius:
      "10px",
    padding:
      "0 10px",
    background:
      "white"
  };