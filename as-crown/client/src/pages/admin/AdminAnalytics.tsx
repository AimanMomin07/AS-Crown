import {
  useCallback,
  useEffect,
  useState
} from "react";

import type {
  CSSProperties,
  ReactNode
} from "react";

import {
  Activity,
  AlertTriangle,
  Building2,
  Car,
  CircleDollarSign,
  Clock3,
  FileWarning,
  RefreshCw,
  UserCheck,
  WalletCards
} from "lucide-react";

import {
  getAdminAnalytics
} from "../../api/admin-analytics.api";

import type {
  AdminAnalytics
} from "../../api/admin-analytics.api";

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


export default function AdminAnalytics() {

  const [
    data,
    setData
  ] =
    useState<
      AdminAnalytics | null
    >(null);

  const [
    loading,
    setLoading
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing
  ] =
    useState(false);

  const [
    error,
    setError
  ] =
    useState("");

  const [
    lastUpdated,
    setLastUpdated
  ] =
    useState<Date | null>(
      null
    );


  const loadAnalytics =
    useCallback(
      async (
        refresh = false
      ) => {

        try {

          if (refresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const response =
            await getAdminAnalytics();

          setData(
            response?.data ||
            null
          );

          setLastUpdated(
            new Date()
          );

        } catch (
          requestError: unknown
        ) {

          console.error(
            "Load analytics error:",
            requestError
          );

          setError(
            getErrorMessage(
              requestError,
              "Unable to load analytics."
            )
          );

        } finally {

          setLoading(false);
          setRefreshing(false);

        }

      },
      []
    );


  useEffect(() => {

    void loadAnalytics();

    const interval =
      window.setInterval(
        () => {
          void loadAnalytics(
            true
          );
        },
        30_000
      );

    return () =>
      window.clearInterval(
        interval
      );

  }, [
    loadAnalytics
  ]);


  if (loading) {

    return (
      <div
        style={loadingPage}
      >
        Loading society analytics...
      </div>
    );

  }


  if (!data) {

    return (
      <div
        style={page}
      >
        <div
          style={errorCard}
        >
          <AlertTriangle
            size={28}
          />

          <strong>
            Unable to load analytics
          </strong>

          <span>
            {
              error ||
              "No analytics data available."
            }
          </span>

          <button
            type="button"
            onClick={() =>
              void loadAnalytics()
            }
            style={retryButton}
          >
            Try Again
          </button>
        </div>
      </div>
    );

  }


  const occupancyValues =
    [
      {
        label: "Occupied",
        value:
          data.occupancy.occupied
      },
      {
        label: "Rented",
        value:
          data.occupancy.rented
      },
      {
        label: "Vacant",
        value:
          data.occupancy.vacant
      },
      {
        label: "Maintenance",
        value:
          data.occupancy.maintenance
      }
    ];


  const complaintValues =
    [
      {
        label: "Open",
        value:
          data.complaints.open
      },
      {
        label: "In Progress",
        value:
          data.complaints.inProgress
      },
      {
        label: "Resolved",
        value:
          data.complaints.resolved
      },
      {
        label: "Closed",
        value:
          data.complaints.closed
      },
      {
        label: "Rejected",
        value:
          data.complaints.rejected
      }
    ];


  const visitorValues =
    [
      {
        label: "Expected",
        value:
          data.visitors.expected
      },
      {
        label: "Inside",
        value:
          data.visitors.inside
      },
      {
        label: "Completed",
        value:
          data.visitors.completed
      },
      {
        label: "Rejected",
        value:
          data.visitors.rejected
      }
    ];


  const collectionMax =
    Math.max(
      ...data.monthlyCollection.map(
        item =>
          Number(
            item.total
          )
      ),
      1
    );


  const collectionPoints =
    buildLinePoints(
      data.monthlyCollection.map(
        item =>
          Number(
            item.total
          )
      ),
      700,
      250,
      28
    );


  const collectionArea =
    buildLineArea(
      data.monthlyCollection.map(
        item =>
          Number(
            item.total
          )
      ),
      700,
      250,
      28
    );


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
              MANAGEMENT INSIGHTS
            </div>

            <h1
              style={title}
            >
              Society Analytics
            </h1>

            <p
              style={subtitle}
            >
              Live operational overview of AS CROWN.
            </p>
          </div>

          <div
            style={headerActions}
          >

            <div
              style={liveBadge}
            >
              <span
                style={liveDot}
              />
              LIVE · 30s refresh
            </div>

            <button
              type="button"
              onClick={() =>
                void loadAnalytics(
                  true
                )
              }
              disabled={
                refreshing
              }
              style={{
                ...refreshButton,
                opacity:
                  refreshing
                    ? 0.6
                    : 1
              }}
            >
              <RefreshCw
                size={16}
              />
              {
                refreshing
                  ? "Refreshing..."
                  : "Refresh"
              }
            </button>

          </div>

        </header>


        {error && (
          <div
            style={errorBox}
          >
            {error}
          </div>
        )}


        <div
          style={statsGrid}
        >

          <MetricCard
            icon={
              <Building2 size={20} />
            }
            label="Occupancy"
            value={
              `${data.occupancy.percentage}%`
            }
            description={
              `${data.occupancy.occupied + data.occupancy.rented} of ${data.occupancy.totalFlats} occupied/rented`
            }
            background="#eff6ff"
            foreground="#2563eb"
          />

          <MetricCard
            icon={
              <WalletCards size={20} />
            }
            label="Collected This Month"
            value={
              money(
                data.finance.collectedThisMonth
              )
            }
            description={
              `Billed ${money(
                data.finance.billedThisMonth
              )}`
            }
            background="#ecfdf5"
            foreground="#059669"
          />

          <MetricCard
            icon={
              <CircleDollarSign size={20} />
            }
            label="Outstanding"
            value={
              money(
                data.finance.outstanding
              )
            }
            description={
              `${data.finance.overdueCount} overdue bills`
            }
            background="#fff7ed"
            foreground="#ea580c"
          />

          <MetricCard
            icon={
              <FileWarning size={20} />
            }
            label="Active Complaints"
            value={
              String(
                data.complaints.open +
                data.complaints.inProgress
              )
            }
            description={
              `${data.complaints.resolved} resolved`
            }
            background="#fef2f2"
            foreground="#dc2626"
          />

          <MetricCard
            icon={
              <Car size={20} />
            }
            label="Visitors Today"
            value={
              String(
                data.visitors.total
              )
            }
            description={
              `${data.visitors.inside} currently inside`
            }
            background="#f5f3ff"
            foreground="#7c3aed"
          />

          <MetricCard
            icon={
              <UserCheck size={20} />
            }
            label="Staff Present"
            value={
              String(
                data.staffAttendance.present
              )
            }
            description={
              `${data.staffAttendance.late} late`
            }
            background="#ecfeff"
            foreground="#0891b2"
          />

          <MetricCard
            icon={
              <Clock3 size={20} />
            }
            label="Overdue Amount"
            value={
              money(
                data.finance.overdueAmount
              )
            }
            description={
              `${data.finance.overdueCount} overdue`
            }
            background="#fff7ed"
            foreground="#ea580c"
          />

          <MetricCard
            icon={
              <Activity size={20} />
            }
            label="Latest Collection"
            value={
              data.monthlyCollection.length
                ? money(
                    data.monthlyCollection[
                      data.monthlyCollection.length - 1
                    ]?.total || 0
                  )
                : "₹0"
            }
            description={
              lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString(
                    "en-IN"
                  )}`
                : "Live data"
            }
            background="#f0fdf4"
            foreground="#16a34a"
          />

        </div>


        <section
          style={panel}
        >

          <div
            style={panelHeader}
          >
            <div>
              <div
                style={eyebrowSmall}
              >
                FINANCE
              </div>

              <h2
                style={panelTitle}
              >
                Collection Trend
              </h2>
            </div>

            <div
              style={chartLegend}
            >
              <span>
                6-month successful payments
              </span>
            </div>
          </div>


          <div
            style={lineChartWrap}
          >

            <svg
              viewBox="0 0 700 250"
              width="100%"
              height="250"
              role="img"
              aria-label="Six month collection trend"
            >

              {[0, 1, 2, 3, 4].map(
                index => {

                  const y =
                    28 +
                    (
                      194 /
                      4
                    ) *
                    index;

                  return (
                    <line
                      key={
                        index
                      }
                      x1="28"
                      x2="672"
                      y1={y}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                  );

                }
              )}


              <polygon
                points={
                  collectionArea
                }
                fill="#dbeafe"
                opacity="0.75"
              />

              <polyline
                points={
                  collectionPoints
                }
                fill="none"
                stroke="#2563eb"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />


              {data.monthlyCollection.map(
                (
                  item,
                  index
                ) => {

                  const x =
                    lineX(
                      index,
                      data.monthlyCollection.length,
                      700,
                      28
                    );

                  const y =
                    lineY(
                      Number(
                        item.total
                      ),
                      collectionMax,
                      250,
                      28
                    );

                  return (
                    <g
                      key={
                        item.month
                      }
                    >
                      <circle
                        cx={
                          x
                        }
                        cy={
                          y
                        }
                        r="5"
                        fill="white"
                        stroke="#2563eb"
                        strokeWidth="3"
                      />

                      <text
                        x={
                          x
                        }
                        y="244"
                        textAnchor="middle"
                        fontSize="10"
                        fill="#64748b"
                      >
                        {
                          formatMonth(
                            item.month
                          )
                        }
                      </text>

                    </g>
                  );

                }
              )}

            </svg>

          </div>

        </section>


        <div
          style={twoColumns}
        >

          <ChartPanel
            title="Occupancy Mix"
            eyebrowText="FLATS"
          >
            <div
              style={pieLayout}
            >

              <PieChart
                values={
                  occupancyValues
                }
              />

              <Legend
                values={
                  occupancyValues
                }
              />

            </div>
          </ChartPanel>


          <ChartPanel
            title="Complaint Status"
            eyebrowText="WORKFLOW"
          >
            <div
              style={barList}
            >
              {
                complaintValues.map(
                  item => (
                    <HorizontalBar
                      key={
                        item.label
                      }
                      label={
                        item.label
                      }
                      value={
                        item.value
                      }
                      total={
                        data.complaints.total
                      }
                    />
                  )
                )
              }
            </div>
          </ChartPanel>

        </div>


        <div
          style={twoColumns}
        >

          <ChartPanel
            title="Visitor Activity"
            eyebrowText="SECURITY"
          >
            <div
              style={barList}
            >
              {
                visitorValues.map(
                  item => (
                    <HorizontalBar
                      key={
                        item.label
                      }
                      label={
                        item.label
                      }
                      value={
                        item.value
                      }
                      total={
                        data.visitors.total
                      }
                    />
                  )
                )
              }
            </div>
          </ChartPanel>


          <ChartPanel
            title="Staff Attendance"
            eyebrowText="PEOPLE"
          >
            <div
              style={barList}
            >
              <HorizontalBar
                label="Present"
                value={
                  data.staffAttendance.present
                }
                total={
                  data.staffAttendance.total
                }
              />

              <HorizontalBar
                label="Absent"
                value={
                  data.staffAttendance.absent
                }
                total={
                  data.staffAttendance.total
                }
              />

              <HorizontalBar
                label="Late"
                value={
                  data.staffAttendance.late
                }
                total={
                  data.staffAttendance.total
                }
              />

              <HorizontalBar
                label="Half Day"
                value={
                  data.staffAttendance.halfDay
                }
                total={
                  data.staffAttendance.total
                }
              />

              <HorizontalBar
                label="Leave"
                value={
                  data.staffAttendance.leave
                }
                total={
                  data.staffAttendance.total
                }
              />
            </div>
          </ChartPanel>

        </div>


        <section
          style={panel}
        >

          <div
            style={panelHeader}
          >
            <div>
              <div
                style={eyebrowSmall}
              >
                BUILDINGS
              </div>

              <h2
                style={panelTitle}
              >
                Building Occupancy
              </h2>
            </div>
          </div>


          <div
            style={buildingGrid}
          >

            {
              data.buildings.map(
                building => (

                  <div
                    key={
                      building.id
                    }
                    style={buildingCard}
                  >

                    <div
                      style={buildingTop}
                    >
                      <strong>
                        {
                          building.name
                        }
                      </strong>

                      <span
                        style={
                          buildingPercentage
                        }
                      >
                        {
                          building.occupancyPercentage
                        }%
                      </span>
                    </div>


                    <div
                      style={buildingBarTrack}
                    >
                      <div
                        style={{
                          ...buildingBar,
                          width:
                            `${Math.min(
                              100,
                              building.occupancyPercentage
                            )}%`
                        }}
                      />
                    </div>


                    <div
                      style={buildingStats}
                    >
                      <span>
                        {
                          building.totalFlats
                        } flats
                      </span>

                      <span>
                        {
                          building.occupied
                        } occupied
                      </span>

                      <span>
                        {
                          building.rented
                        } rented
                      </span>

                      <span>
                        {
                          building.vacant
                        } vacant
                      </span>
                    </div>

                  </div>

                )
              )
            }

          </div>

        </section>


        <section
          style={panel}
        >

          <div
            style={panelHeader}
          >

            <div>
              <div
                style={eyebrowSmall}
              >
                AUDIT ACTIVITY
              </div>

              <h2
                style={panelTitle}
              >
                Recent Admin Activity
              </h2>
            </div>

          </div>


          {
            data.recentActivity.length ===
            0
              ? (
                <div
                  style={empty}
                >
                  No recent activity.
                </div>
              )
              : (
                <div
                  style={activityList}
                >
                  {
                    data.recentActivity.map(
                      item => (
                        <div
                          key={
                            item.id
                          }
                          style={
                            activityRow
                          }
                        >

                          <div
                            style={
                              activityIcon
                            }
                          >
                            <Activity
                              size={15}
                            />
                          </div>

                          <div
                            style={
                              activityContent
                            }
                          >
                            <strong>
                              {
                                humanize(
                                  item.action
                                )
                              }
                            </strong>

                            <span>
                              {
                                item.entityType
                              }
                              {
                                item.entityId
                                  ? ` #${item.entityId}`
                                  : ""
                              }
                            </span>
                          </div>

                          <div
                            style={
                              activityMeta
                            }
                          >
                            <strong>
                              {
                                item.userName
                              }
                            </strong>

                            <span>
                              {
                                new Date(
                                  item.createdAt
                                ).toLocaleString(
                                  "en-IN"
                                )
                              }
                            </span>
                          </div>

                        </div>
                      )
                    )
                  }
                </div>
              )
          }

        </section>

      </div>

    </div>
  );
}


/* =========================================================
   COMPONENTS
========================================================= */

function MetricCard({
  icon,
  label,
  value,
  description,
  background,
  foreground
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
  background: string;
  foreground: string;
}) {
  return (
    <div
      style={
        metricCard
      }
    >
      <div
        style={{
          ...metricIcon,
          background,
          color:
            foreground
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={
            metricLabel
          }
        >
          {label}
        </div>

        <strong
          style={
            metricValue
          }
        >
          {value}
        </strong>

        <div
          style={
            metricDescription
          }
        >
          {description}
        </div>
      </div>
    </div>
  );
}


function ChartPanel({
  eyebrowText,
  title,
  children
}: {
  eyebrowText: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      style={panel}
    >
      <div
        style={
          panelHeader
        }
      >
        <div>
          <div
            style={
              eyebrowSmall
            }
          >
            {eyebrowText}
          </div>

          <h2
            style={
              panelTitle
            }
          >
            {title}
          </h2>
        </div>
      </div>

      {children}
    </section>
  );
}


function PieChart({
  values
}: {
  values: {
    label: string;
    value: number;
  }[];
}) {

  const total =
    values.reduce(
      (
        sum,
        item
      ) =>
        sum +
        item.value,
      0
    );

  const colors =
    [
      "#2563eb",
      "#7c3aed",
      "#f59e0b",
      "#94a3b8"
    ];

  const segments =
    values.map(
      (
        item,
        index
      ) => {

        const cursor =
          values
            .slice(0, index)
            .reduce(
              (sum, previous) =>
                sum + previous.value,
              0
            );

        const start =
          total > 0
            ? (
                cursor /
                total
              ) *
              100
            : 0;

        const nextCursor =
          cursor +
          item.value;

        const end =
          total > 0
            ? (
                nextCursor /
                total
              ) *
              100
            : 0;

        return {
          ...item,
          start,
          end,
          color:
            colors[
              index %
              colors.length
            ]
        };
      }
    );

  const gradient =
    segments.length
      ? `conic-gradient(${segments
          .map(
            segment =>
              `${segment.color} ${segment.start}% ${segment.end}%`
          )
          .join(", ")})`
      : "conic-gradient(#e2e8f0 0 100%)";

  return (
    <div
      style={
        pieContainer
      }
    >
      <div
        style={{
          ...pie,
          background:
            gradient
        }}
      >
        <div
          style={
            pieCenter
          }
        >
          <strong>
            {total}
          </strong>

          <span>
            flats
          </span>
        </div>
      </div>
    </div>
  );
}


function Legend({
  values
}: {
  values: {
    label: string;
    value: number;
  }[];
}) {

  const colors =
    [
      "#2563eb",
      "#7c3aed",
      "#f59e0b",
      "#94a3b8"
    ];

  return (
    <div
      style={
        legend
      }
    >
      {
        values.map(
          (
            item,
            index
          ) => (
            <div
              key={
                item.label
              }
              style={
                legendRow
              }
            >
              <span
                style={{
                  ...legendDot,
                  background:
                    colors[
                      index %
                      colors.length
                    ]
                }}
              />

              <span
                style={
                  legendLabel
                }
              >
                {item.label}
              </span>

              <strong>
                {item.value}
              </strong>
            </div>
          )
        )
      }
    </div>
  );
}


function HorizontalBar({
  label,
  value,
  total
}: {
  label: string;
  value: number;
  total: number;
}) {

  const percentage =
    total > 0
      ? Math.min(
          100,
          (
            value /
            total
          ) *
            100
        )
      : 0;

  return (
    <div
      style={
        progressRow
      }
    >

      <div
        style={
          progressHeader
        }
      >
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>
      </div>

      <div
        style={
          progressTrack
        }
      >
        <div
          style={{
            ...progressBar,
            width:
              `${percentage}%`
          }}
        />
      </div>

    </div>
  );
}


/* =========================================================
   HELPERS
========================================================= */

function money(
  value: number
) {
  return `₹${Number(
    value || 0
  ).toLocaleString(
    "en-IN"
  )}`;
}


function formatMonth(
  value: string
) {
  const [
    year,
    month
  ] =
    value.split(
      "-"
    );

  return new Date(
    Number(year),
    Number(month) - 1
  ).toLocaleDateString(
    "en-IN",
    {
      month:
        "short"
    }
  );
}


function humanize(
  value: string
) {
  return value
    .replaceAll(
      "_",
      " "
    )
    .replace(
      /\b\w/g,
      character =>
        character.toUpperCase()
    );
}


function lineX(
  index: number,
  length: number,
  width: number,
  padding: number
) {
  if (length <= 1) {
    return width / 2;
  }

  return (
    padding +
    (
      (
        width -
        padding * 2
      ) /
      (length - 1)
    ) *
    index
  );
}


function lineY(
  value: number,
  max: number,
  height: number,
  padding: number
) {
  const chartHeight =
    height -
    padding * 2;

  return (
    height -
    padding -
    (
      (
        value /
        Math.max(
          max,
          1
        )
      ) *
      chartHeight
    )
  );
}


function buildLinePoints(
  values: number[],
  width: number,
  height: number,
  padding: number
) {
  const max =
    Math.max(
      ...values,
      1
    );

  return values
    .map(
      (
        value,
        index
      ) =>
        `${lineX(
          index,
          values.length,
          width,
          padding
        )},${lineY(
          value,
          max,
          height,
          padding
        )}`
    )
    .join(" ");
}


function buildLineArea(
  values: number[],
  width: number,
  height: number,
  padding: number
) {
  if (
    values.length ===
    0
  ) {
    return "";
  }

  const max =
    Math.max(
      ...values,
      1
    );

  const firstX =
    lineX(
      0,
      values.length,
      width,
      padding
    );

  const lastX =
    lineX(
      values.length - 1,
      values.length,
      width,
      padding
    );

  const points =
    values
      .map(
        (
          value,
          index
        ) =>
          `${lineX(
            index,
            values.length,
            width,
            padding
          )},${lineY(
            value,
            max,
            height,
            padding
          )}`
      )
      .join(" ");

  return `${firstX},${height - padding} ${points} ${lastX},${height - padding}`;
}


/* =========================================================
   STYLES
========================================================= */

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
      1500,
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
      22
  };

const headerActions:
  CSSProperties = {
    display:
      "flex",
    alignItems:
      "center",
    gap:
      9,
    flexWrap:
      "wrap"
  };

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

const eyebrowSmall:
  CSSProperties = {
    fontSize:
      10,
    fontWeight:
      800,
    letterSpacing:
      1.3,
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

const liveBadge:
  CSSProperties = {
    display:
      "inline-flex",
    alignItems:
      "center",
    gap:
      7,
    padding:
      "8px 10px",
    borderRadius:
      999,
    background:
      "#ecfdf5",
    color:
      "#047857",
    fontSize:
      10,
    fontWeight:
      800,
    border:
      "1px solid #a7f3d0"
  };

const liveDot:
  CSSProperties = {
    width:
      7,
    height:
      7,
    borderRadius:
      999,
    background:
      "#10b981"
  };

const refreshButton:
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

const retryButton:
  CSSProperties = {
    height:
      40,
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
      "#b91c1c",
    border:
      "1px solid #fecaca"
  };

const statsGrid:
  CSSProperties = {
    display:
      "grid",
    gridTemplateColumns:
      "repeat(4,minmax(0,1fr))",
    gap:
      14,
    marginBottom:
      14
  };

const metricCard:
  CSSProperties = {
    background:
      "white",
    border:
      "1px solid #e2e8f0",
    borderRadius:
      15,
    padding:
      17,
    display:
      "flex",
    gap:
      12,
    alignItems:
      "center"
  };

const metricIcon:
  CSSProperties = {
    width:
      44,
    height:
      44,
    borderRadius:
      11,
    display:
      "grid",
    placeItems:
      "center",
    flexShrink:
      0
  };

const metricLabel:
  CSSProperties = {
    fontSize:
      11,
    color:
      "#64748b",
    fontWeight:
      700
  };

const metricValue:
  CSSProperties = {
    display:
      "block",
    fontSize:
      23,
    marginTop:
      3,
    color:
      "#0f172a"
  };

const metricDescription:
  CSSProperties = {
    marginTop:
      3,
    color:
      "#94a3b8",
    fontSize:
      11
  };

const panel:
  CSSProperties = {
    background:
      "white",
    border:
      "1px solid #e2e8f0",
    borderRadius:
      16,
    padding:
      20,
    marginBottom:
      14
  };

const panelHeader:
  CSSProperties = {
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    gap:
      12,
    marginBottom:
      18
  };

const panelTitle:
  CSSProperties = {
    margin:
      "5px 0 0",
    fontSize:
      19,
    color:
      "#0f172a"
  };

const chartLegend:
  CSSProperties = {
    color:
      "#94a3b8",
    fontSize:
      10
  };

const lineChartWrap:
  CSSProperties = {
    width:
      "100%",
    overflowX:
      "auto"
  };

const twoColumns:
  CSSProperties = {
    display:
      "grid",
    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",
    gap:
      14
  };

const pieLayout:
  CSSProperties = {
    display:
      "grid",
    gridTemplateColumns:
      "minmax(180px, 240px) 1fr",
    gap:
      20,
    alignItems:
      "center"
  };

const pieContainer:
  CSSProperties = {
    display:
      "grid",
    placeItems:
      "center"
  };

const pie:
  CSSProperties = {
    width:
      200,
    height:
      200,
    borderRadius:
      "50%",
    display:
      "grid",
    placeItems:
      "center"
  };

const pieCenter:
  CSSProperties = {
    width:
      108,
    height:
      108,
    borderRadius:
      "50%",
    background:
      "white",
    display:
      "grid",
    placeItems:
      "center",
    alignContent:
      "center",
    boxShadow:
      "0 6px 18px rgba(15,23,42,0.08)"
  };

const legend:
  CSSProperties = {
    display:
      "grid",
    gap:
      10
  };

const legendRow:
  CSSProperties = {
    display:
      "grid",
    gridTemplateColumns:
      "10px 1fr auto",
    alignItems:
      "center",
    gap:
      8,
    fontSize:
      11,
    color:
      "#475569"
  };

const legendDot:
  CSSProperties = {
    width:
      8,
    height:
      8,
    borderRadius:
      999
  };

const legendLabel:
  CSSProperties = {
    fontWeight:
      600
  };

const barList:
  CSSProperties = {
    display:
      "grid",
    gap:
      13
  };

const progressRow:
  CSSProperties = {
    marginBottom:
      2
  };

const progressHeader:
  CSSProperties = {
    display:
      "flex",
    justifyContent:
      "space-between",
    marginBottom:
      6,
    fontSize:
      12,
    color:
      "#64748b"
  };

const progressTrack:
  CSSProperties = {
    height:
      9,
    borderRadius:
      999,
    background:
      "#f1f5f9",
    overflow:
      "hidden"
  };

const progressBar:
  CSSProperties = {
    height:
      "100%",
    background:
      "#2563eb",
    borderRadius:
      999,
    transition:
      "width .3s ease"
  };

const buildingGrid:
  CSSProperties = {
    display:
      "grid",
    gridTemplateColumns:
      "repeat(3,minmax(0,1fr))",
    gap:
      12
  };

const buildingCard:
  CSSProperties = {
    border:
      "1px solid #e2e8f0",
    borderRadius:
      13,
    padding:
      15
  };

const buildingTop:
  CSSProperties = {
    display:
      "flex",
    justifyContent:
      "space-between",
    gap:
      10
  };

const buildingPercentage:
  CSSProperties = {
    color:
      "#2563eb",
    fontWeight:
      800,
    fontSize:
      13
  };

const buildingBarTrack:
  CSSProperties = {
    height:
      8,
    margin:
      "12px 0 10px",
    borderRadius:
      999,
    background:
      "#f1f5f9",
    overflow:
      "hidden"
  };

const buildingBar:
  CSSProperties = {
    height:
      "100%",
    background:
      "#2563eb",
    borderRadius:
      999,
    transition:
      "width .3s ease"
  };

const buildingStats:
  CSSProperties = {
    display:
      "flex",
    justifyContent:
      "space-between",
    gap:
      7,
    color:
      "#64748b",
    fontSize:
      10,
    flexWrap:
      "wrap"
  };

const activityList:
  CSSProperties = {
    display:
      "grid",
    gap:
      8
  };

const activityRow:
  CSSProperties = {
    display:
      "grid",
    gridTemplateColumns:
      "34px 1fr auto",
    gap:
      10,
    alignItems:
      "center",
    padding:
      "10px 0",
    borderBottom:
      "1px solid #f1f5f9"
  };

const activityIcon:
  CSSProperties = {
    width:
      34,
    height:
      34,
    borderRadius:
      10,
    display:
      "grid",
    placeItems:
      "center",
    background:
      "#eff6ff",
    color:
      "#2563eb"
  };

const activityContent:
  CSSProperties = {
    display:
      "grid",
    gap:
      3
  };

const activityMeta:
  CSSProperties = {
    display:
      "grid",
    gap:
      3,
    justifyItems:
      "end",
    color:
      "#94a3b8",
    fontSize:
      10
  };

const empty:
  CSSProperties = {
    color:
      "#94a3b8",
    textAlign:
      "center",
    padding:
      30
  };

const loadingPage:
  CSSProperties = {
    minHeight:
      "70vh",
    display:
      "grid",
    placeItems:
      "center",
    color:
      "#64748b"
  };

const errorCard:
  CSSProperties = {
    background:
      "white",
    padding:
      30,
    borderRadius:
      16,
    border:
      "1px solid #e2e8f0",
    display:
      "flex",
    flexDirection:
      "column",
    gap:
      8,
    alignItems:
      "center"
  };
