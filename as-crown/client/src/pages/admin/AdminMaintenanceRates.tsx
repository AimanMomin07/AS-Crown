import {
  useEffect,
  useState
} from "react";

import type {
  CSSProperties
} from "react";

import {
  Save,
  RefreshCw,
  Settings2
} from "lucide-react";

import {
  getMaintenanceRates,
  saveMaintenanceRate
} from "../../api/maintenance-rates.api";

import type {
  MaintenanceRate
} from "../../api/maintenance-rates.api";

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


const FLAT_TYPES = [
  "1BHK",
  "2BHK",
  "3BHK",
  "4BHK",
  "Penthouse",
  "Other"
];


export default function AdminMaintenanceRates() {

  const [
    rates,
    setRates
  ] =
    useState<
      MaintenanceRate[]
    >([]);


  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    savingType,
    setSavingType
  ] =
    useState<
      string |
      null
    >(null);


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


  async function loadRates() {

    try {

      setLoading(
        true
      );

      setError("");


      const response =
        await getMaintenanceRates();


      setRates(
        response
          ?.data
          ?.rates ||
        []
      );

    } catch (
      requestError: unknown
    ) {

      console.error(
        requestError
      );


      setError(getErrorMessage(requestError, "Unable to load maintenance rates."));

    } finally {

      setLoading(
        false
      );

    }

  }


  useEffect(() => {

    void loadRates();

  }, []);


  function updateRate(
    flatType:
      string,

    field:
      keyof MaintenanceRate,

    value:
      string
  ) {

    setRates(
      current => {

        const exists =
          current.some(
            rate =>
              rate.flat_type ===
              flatType
          );


        if (
          !exists
        ) {

          return [

            ...current,

            {

              id:
                0,

              flat_type:
                flatType,

              maintenance_amount:
                0,

              electricity_amount:
                0,

              water_amount:
                0,

              parking_amount:
                0,

              penalty_amount:
                0,

              other_amount:
                0,

              late_fee_per_day:
                0,

              grace_days:
                0,

              status:
                "active"

            }

          ];

        }


        return current.map(
          rate =>
            rate.flat_type ===
            flatType

              ? {
                  ...rate,

                  [field]:
                    field ===
                      "status"

                      ? value

                      : Number(
                          value
                        )
                }

              : rate
        );

      }
    );

  }


  function getRate(
    flatType:
      string
  ) {

    return (
      rates.find(
        rate =>
          rate.flat_type ===
          flatType
      ) ||
      {

        id:
          0,

        flat_type:
          flatType,

        maintenance_amount:
          0,

        electricity_amount:
          0,

        water_amount:
          0,

        parking_amount:
          0,

        penalty_amount:
          0,

        other_amount:
          0,

        late_fee_per_day:
          0,

        grace_days:
          0,

        status:
          "active"

      }
    );

  }


  async function handleSave(
    flatType:
      string
  ) {

    try {

      setSavingType(
        flatType
      );

      setError("");

      setSuccess("");


      const rate =
        getRate(
          flatType
        );


      await saveMaintenanceRate({

        flatType,

        maintenanceAmount:
          Number(
            rate.maintenance_amount
          ),

        electricityAmount:
          Number(
            rate.electricity_amount
          ),

        waterAmount:
          Number(
            rate.water_amount
          ),

        parkingAmount:
          Number(
            rate.parking_amount
          ),

        penaltyAmount:
          Number(
            rate.penalty_amount
          ),

        otherAmount:
          Number(
            rate.other_amount
          ),

        lateFeePerDay:
          Number(
            rate.late_fee_per_day
          ),

        graceDays:
          Number(
            rate.grace_days
          ),

        status:
          rate.status

      });


      setSuccess(
        `${flatType} rate saved successfully.`
      );


      await loadRates();

    } catch (
      requestError: unknown
    ) {

      console.error(
        requestError
      );


      setError(getErrorMessage(requestError, "Unable to save rate."));

    } finally {

      setSavingType(
        null
      );

    }

  }


  return (

    <div
      style={page}
    >

      <div
        style={container}
    >

        <header
          style={header}
        >

          <div>

            <div
              style={eyebrow}
            >
              BILLING CONFIGURATION
            </div>

            <h1
              style={title}
            >
              Maintenance Rates
            </h1>

            <p
              style={subtitle}
            >
              Configure the default monthly charges used by the billing engine.
            </p>

          </div>


          <button
            type="button"
            onClick={() =>
              void loadRates()
            }
            style={secondary}
          >

            <RefreshCw
              size={16}
            />

            Refresh

          </button>

        </header>


        {error && (
          <div
            style={errorBox}
          >
            {error}
          </div>
        )}


        {success && (
          <div
            style={successBox}
          >
            {success}
          </div>
        )}


        {loading ? (

          <div
            style={empty}
          >
            Loading maintenance rates...
          </div>

        ) : (

          <div
            style={grid}
          >

            {FLAT_TYPES.map(
              flatType => {

                const rate =
                  getRate(
                    flatType
                  );


                return (

                  <section
                    key={flatType}
                    style={card}
                  >

                    <div
                      style={cardHeader}
                    >

                      <div
                        style={icon}
                      >

                        <Settings2
                          size={20}
                        />

                      </div>


                      <div>

                        <strong>
                          {flatType}
                        </strong>

                        <div
                          style={muted}
                        >
                          Default monthly rate
                        </div>

                      </div>

                    </div>


                    <NumberField
                      label="Maintenance"
                      value={
                        rate.maintenance_amount
                      }

                      onChange={
                        value =>
                          updateRate(
                            flatType,
                            "maintenance_amount",
                            value
                          )
                      }
                    />


                    <NumberField
                      label="Electricity"
                      value={
                        rate.electricity_amount
                      }

                      onChange={
                        value =>
                          updateRate(
                            flatType,
                            "electricity_amount",
                            value
                          )
                      }
                    />


                    <NumberField
                      label="Water"
                      value={
                        rate.water_amount
                      }

                      onChange={
                        value =>
                          updateRate(
                            flatType,
                            "water_amount",
                            value
                          )
                      }
                    />


                    <NumberField
                      label="Parking"
                      value={
                        rate.parking_amount
                      }

                      onChange={
                        value =>
                          updateRate(
                            flatType,
                            "parking_amount",
                            value
                          )
                      }
                    />


                    <NumberField
                      label="Base Penalty"
                      value={
                        rate.penalty_amount
                      }

                      onChange={
                        value =>
                          updateRate(
                            flatType,
                            "penalty_amount",
                            value
                          )
                      }
                    />


                    <NumberField
                      label="Other"
                      value={
                        rate.other_amount
                      }

                      onChange={
                        value =>
                          updateRate(
                            flatType,
                            "other_amount",
                            value
                          )
                      }
                    />


                    <NumberField
                      label="Late fee / day"
                      value={
                        rate.late_fee_per_day
                      }

                      onChange={
                        value =>
                          updateRate(
                            flatType,
                            "late_fee_per_day",
                            value
                          )
                      }
                    />


                    <NumberField
                      label="Grace days"
                      value={
                        rate.grace_days
                      }

                      onChange={
                        value =>
                          updateRate(
                            flatType,
                            "grace_days",
                            value
                          )
                      }
                    />


                    <div
                      style={totalBox}
                    >

                      <span>
                        Base Monthly Total
                      </span>

                      <strong>

                        ₹
                        {
                          (
                            Number(
                              rate.maintenance_amount
                            ) +

                            Number(
                              rate.electricity_amount
                            ) +

                            Number(
                              rate.water_amount
                            ) +

                            Number(
                              rate.parking_amount
                            ) +

                            Number(
                              rate.penalty_amount
                            ) +

                            Number(
                              rate.other_amount
                            )

                          ).toLocaleString(
                            "en-IN"
                          )
                        }

                      </strong>

                    </div>


                    <button
                      type="button"

                      onClick={() =>
                        void handleSave(
                          flatType
                        )
                      }

                      disabled={
                        savingType ===
                        flatType
                      }

                      style={{
                        ...primary,

                        opacity:
                          savingType ===
                          flatType
                            ? 0.6
                            : 1
                      }}
                    >

                      <Save
                        size={16}
                      />

                      {
                        savingType ===
                        flatType
                          ? "Saving..."
                          : "Save Rate"
                      }

                    </button>

                  </section>

                );

              }
            )}

          </div>

        )}

      </div>

    </div>

  );

}


function NumberField({
  label,
  value,
  onChange
}: {
  label:
    string;

  value:
    number;

  onChange:
    (
      value:
        string
    ) => void;
}) {

  return (

    <label
      style={fieldLabel}
    >

      {label}

      <input
        type="number"
        min="0"
        step="0.01"
        value={
          value
        }

        onChange={
          event =>
            onChange(
              event.target.value
            )
        }

        style={input}
      />

    </label>

  );

}


const page:
  CSSProperties = {
    minHeight:
      "100vh",
    background:
      "#f8fafc",
    padding:
      28
  };


const container:
  CSSProperties = {
    maxWidth:
      1350,
    margin:
      "0 auto"
  };


const header:
  CSSProperties = {
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


const eyebrow:
  CSSProperties = {
    fontSize:
      10,
    fontWeight:
      800,
    letterSpacing:
      1.4,
    color:
      "#2563eb"
  };


const title:
  CSSProperties = {
    margin:
      "5px 0",
    fontSize:
      30,
    color:
      "#0f172a"
  };


const subtitle:
  CSSProperties = {
    margin:
      0,
    color:
      "#64748b"
  };


const grid:
  CSSProperties = {
    display:
      "grid",
    gridTemplateColumns:
      "repeat(3,minmax(0,1fr))",
    gap:
      15
  };


const card:
  CSSProperties = {
    background:
      "white",
    border:
      "1px solid #e2e8f0",
    borderRadius:
      16,
    padding:
      18
  };


const cardHeader:
  CSSProperties = {
    display:
      "flex",
    alignItems:
      "center",
    gap:
      10,
    marginBottom:
      16
  };


const icon:
  CSSProperties = {
    width:
      40,
    height:
      40,
    borderRadius:
      10,
    background:
      "#eff6ff",
    color:
      "#2563eb",
    display:
      "grid",
    placeItems:
      "center"
  };


const muted:
  CSSProperties = {
    color:
      "#94a3b8",
    fontSize:
      11,
    marginTop:
      2
  };


const fieldLabel:
  CSSProperties = {
    display:
      "block",
    fontSize:
      11,
    color:
      "#64748b",
    fontWeight:
      700,
    marginBottom:
      11
  };


const input:
  CSSProperties = {
    width:
      "100%",
    height:
      40,
    boxSizing:
      "border-box",
    marginTop:
      5,
    border:
      "1px solid #e2e8f0",
    borderRadius:
      8,
    padding:
      "0 10px",
    outline:
      "none"
  };


const totalBox:
  CSSProperties = {
    margin:
      "14px 0",
    padding:
      12,
    borderRadius:
      10,
    background:
      "#f8fafc",
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    color:
      "#64748b",
    fontSize:
      12
  };


const primary:
  CSSProperties = {
    width:
      "100%",
    height:
      42,
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
    justifyContent:
      "center",
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
  CSSProperties = {
    height:
      42,
    padding:
      "0 13px",
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
      "pointer",
    fontWeight:
      700
  };


const errorBox:
  CSSProperties = {
    padding:
      12,
    marginBottom:
      15,
    borderRadius:
      10,
    background:
      "#fef2f2",
    color:
      "#b91c1c"
  };


const successBox:
  CSSProperties = {
    padding:
      12,
    marginBottom:
      15,
    borderRadius:
      10,
    background:
      "#ecfdf5",
    color:
      "#047857"
  };


const empty:
  CSSProperties = {
    background:
      "white",
    border:
      "1px solid #e2e8f0",
    borderRadius:
      16,
    padding:
      50,
    textAlign:
      "center",
    color:
      "#94a3b8"
  };