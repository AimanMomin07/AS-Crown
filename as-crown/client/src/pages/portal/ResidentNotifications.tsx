import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Bell,
  Check,
  CheckCheck,
  CreditCard,
  MessageSquareWarning,
  Megaphone,
  ShieldAlert,
  Users,
  Settings,
  RefreshCw
} from "lucide-react";

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead
} from "../../api/notifications.api";

import type {
  Notification,
  NotificationType
} from "../../api/notifications.api";


type Filter =
  | "all"
  | NotificationType;


const FILTERS: {
  value:
    Filter;

  label:
    string;
}[] = [

  {
    value:
      "all",

    label:
      "All"
  },

  {
    value:
      "payment",

    label:
      "Bills & Payments"
  },

  {
    value:
      "complaint",

    label:
      "Complaints"
  },

  {
    value:
      "visitor",

    label:
      "Visitors"
  },

  {
    value:
      "announcement",

    label:
      "Announcements"
  },

  {
    value:
      "security",

    label:
      "Security"
  },

  {
    value:
      "system",

    label:
      "System"
  }

];


export default function ResidentNotifications() {

  const [
    notifications,
    setNotifications
  ] =
    useState<
      Notification[]
    >([]);


  const [
    filter,
    setFilter
  ] =
    useState<Filter>(
      "all"
    );


  const [
    unreadCount,
    setUnreadCount
  ] =
    useState(0);


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
    processingId,
    setProcessingId
  ] =
    useState<
      number |
      null
    >(null);


  const loadNotifications =
    useCallback(
      async (
        showLoading =
          true
      ) => {

        try {

          if (
            showLoading
          ) {

            setLoading(
              true
            );

          } else {

            setRefreshing(
              true
            );

          }


          setError("");


          const params =
            filter ===
            "all"

              ? undefined

              : {
                  type:
                    filter
                };


          const [
            notificationResponse,
            countResponse
          ] =
            await Promise.all([

              getNotifications(
                params
              ),

              getUnreadNotificationCount()

            ]);


          setNotifications(
            notificationResponse
              ?.data
              ?.notifications ||
            []
          );


          setUnreadCount(
            Number(
              countResponse
                ?.data
                ?.unreadCount ||
              0
            )
          );

        } catch (
          requestError: any
        ) {

          console.error(
            "Resident notifications error:",
            requestError
          );


          setError(
            requestError
              ?.response
              ?.data
              ?.message ||
            "Unable to load notifications."
          );

        } finally {

          setLoading(
            false
          );

          setRefreshing(
            false
          );

        }

      },
      [
        filter
      ]
    );


  useEffect(() => {

    void loadNotifications();

  }, [
    loadNotifications
  ]);


  async function handleMarkRead(
    id:
      number
  ) {

    try {

      setProcessingId(
        id
      );


      await markNotificationRead(
        id
      );


      setNotifications(
        current =>
          current.map(
            item =>
              item.id === id

                ? {
                    ...item,

                    is_read:
                      1,

                    read_at:
                      new Date()
                        .toISOString()
                  }

                : item
          )
      );


      setUnreadCount(
        current =>
          Math.max(
            0,
            current - 1
          )
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
        "Unable to mark notification as read."
      );

    } finally {

      setProcessingId(
        null
      );

    }

  }


  async function handleMarkAllRead() {

    if (
      unreadCount ===
      0
    ) {

      return;

    }


    try {

      setProcessingId(
        -1
      );


      await markAllNotificationsRead();


      setNotifications(
        current =>
          current.map(
            item => ({
              ...item,

              is_read:
                1,

              read_at:
                item.read_at ||
                new Date()
                  .toISOString()

            })
          )
      );


      setUnreadCount(
        0
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
        "Unable to mark all notifications as read."
      );

    } finally {

      setProcessingId(
        null
      );

    }

  }


  const visibleCount =
    useMemo(
      () =>
        notifications.length,
      [
        notifications
      ]
    );


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
              COMMUNICATION
            </div>


            <div
              style={
                titleRow
              }
            >

              <h1
                style={
                  title
                }
              >
                Notifications
              </h1>


              {unreadCount >
                0 && (

                <span
                  style={
                    countBadge
                  }
                >
                  {
                    unreadCount
                  }
                </span>

              )}

            </div>


            <p
              style={
                subtitle
              }
            >
              Stay updated with everything happening in AS CROWN.
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
                void loadNotifications(
                  false
                )
              }

              disabled={
                refreshing
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

              onClick={() =>
                void handleMarkAllRead()
              }

              disabled={
                unreadCount ===
                  0 ||
                processingId ===
                  -1
              }

              style={{
                ...primaryButton,

                opacity:
                  unreadCount ===
                    0 ||
                  processingId ===
                    -1
                    ? 0.55
                    : 1,

                cursor:
                  unreadCount ===
                    0 ||
                  processingId ===
                    -1
                    ? "not-allowed"
                    : "pointer"
              }}
            >

              <CheckCheck
                size={
                  16
                }
              />

              Mark all read

            </button>

          </div>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div
            style={
              errorBox
            }
          >
            {error}
          </div>

        )}


        {/* =================================================
            FILTERS
        ================================================= */}

        <div
          style={
            filterBar
          }
        >

          {FILTERS.map(
            item => (

              <button
                key={
                  item.value
                }

                type="button"

                onClick={() =>
                  setFilter(
                    item.value
                  )
                }

                style={{
                  ...filterButton,

                  ...(filter ===
                  item.value
                    ? activeFilter
                    : {})
                }}
              >

                {item.label}

              </button>

            )
          )}

        </div>


        {/* =================================================
            COUNT
        ================================================= */}

        <div
          style={
            listHeader
          }
        >

          <span>
            {
              visibleCount
            }{" "}
            notification
            {
              visibleCount !==
              1
                ? "s"
                : ""
            }
          </span>


          {unreadCount >
            0 && (

            <span
              style={
                unreadText
              }
            >
              {
                unreadCount
              } unread
            </span>

          )}

        </div>


        {/* =================================================
            CONTENT
        ================================================= */}

        {loading ? (

          <div
            style={
              emptyCard
            }
          >

            <Bell
              size={
                28
              }
            />

            Loading notifications...

          </div>

        ) : notifications.length ===
          0 ? (

          <div
            style={
              emptyCard
            }
          >

            <Bell
              size={
                34
              }
            />

            <strong>
              You're all caught up
            </strong>

            <span
              style={
                muted
              }
            >
              No notifications match this filter.

            </span>

          </div>

        ) : (

          <div
            style={
              list
            }
          >

            {notifications.map(
              notification => (

                <NotificationCard
                  key={
                    notification.id
                  }

                  notification={
                    notification
                  }

                  processing={
                    processingId ===
                    notification.id
                  }

                  onRead={
                    handleMarkRead
                  }

                />

              )
            )}

          </div>

        )}

      </div>

    </div>

  );

}


/* =========================================================
   NOTIFICATION CARD
========================================================= */

function NotificationCard({
  notification,
  processing,
  onRead
}: {
  notification:
    Notification;

  processing:
    boolean;

  onRead:
    (
      id:
        number
    ) =>
      Promise<void>;
}) {

  return (

    <article
      style={{
        ...card,

        background:
          notification.is_read
            ? "white"
            : "#f8fbff",

        borderColor:
          notification.is_read
            ? "#e2e8f0"
            : "#bfdbfe"
      }}
    >

      <div
        style={
          iconForType(
            notification.type
          )
        }
      >

        {
          getIcon(
            notification.type
          )
        }

      </div>


      <div
        style={
          content
        }
      >

        <div
          style={
            cardTop
          }
        >

          <div>

            <div
              style={
                typeLabel
              }
            >

              {
                formatType(
                  notification.type
                )
              }

            </div>


            <h3
              style={
                cardTitle
              }
            >
              {
                notification.title
              }
            </h3>

          </div>


          {!notification.is_read && (

            <span
              style={
                unreadDot
              }
            >
              New
            </span>

          )}

        </div>


        <p
          style={
            message
          }
        >
          {
            notification.message
          }
        </p>


        <div
          style={
            footer
          }
        >

          <span
            style={
              timestamp
            }
          >

            {
              new Date(
                notification.created_at
              ).toLocaleString(
                "en-IN"
              )
            }

          </span>


          {!notification.is_read && (

            <button
              type="button"

              onClick={() =>
                void onRead(
                  notification.id
                )
              }

              disabled={
                processing
              }

              style={
                markReadButton
              }
            >

              <Check
                size={
                  14
                }
              />

              {
                processing
                  ? "Saving..."
                  : "Mark read"
              }

            </button>

          )}

        </div>

      </div>

    </article>

  );

}


/* =========================================================
   ICONS
========================================================= */

function getIcon(
  type:
    NotificationType
) {

  switch (
    type
  ) {

    case "payment":
      return (
        <CreditCard
          size={
            19
          }
        />
      );

    case "complaint":
      return (
        <MessageSquareWarning
          size={
            19
          }
        />
      );

    case "announcement":
      return (
        <Megaphone
          size={
            19
          }
        />
      );

    case "visitor":
      return (
        <Users
          size={
            19
          }
        />
      );

    case "security":
      return (
        <ShieldAlert
          size={
            19
          }
        />
      );

    case "system":
      return (
        <Settings
          size={
            19
          }
        />
      );

    default:
      return (
        <Bell
          size={
            19
          }
        />
      );

  }

}


/* =========================================================
   ICON STYLE
========================================================= */

function iconForType(
  type:
    NotificationType
): React.CSSProperties {

  switch (
    type
  ) {

    case "payment":
      return {
        ...iconBase,
        background:
          "#ecfdf5",
        color:
          "#059669"
      };

    case "complaint":
      return {
        ...iconBase,
        background:
          "#fff7ed",
        color:
          "#ea580c"
      };

    case "announcement":
      return {
        ...iconBase,
        background:
          "#eff6ff",
        color:
          "#2563eb"
      };

    case "visitor":
      return {
        ...iconBase,
        background:
          "#f5f3ff",
        color:
          "#7c3aed"
      };

    case "security":
      return {
        ...iconBase,
        background:
          "#fef2f2",
        color:
          "#dc2626"
      };

    default:
      return {
        ...iconBase,
        background:
          "#f1f5f9",
        color:
          "#475569"
      };

  }

}


/* =========================================================
   TYPE LABEL
========================================================= */

function formatType(
  type:
    NotificationType
) {

  switch (
    type
  ) {

    case "payment":
      return "Bill & Payment";

    case "complaint":
      return "Complaint";

    case "announcement":
      return "Announcement";

    case "visitor":
      return "Visitor";

    case "security":
      return "Security";

    case "system":
      return "System";

    default:
      return "Notification";

  }

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
      1100,

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
      "flex-end",

    gap:
      16,

    flexWrap:
      "wrap",

    marginBottom:
      20

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


const titleRow:
  React.CSSProperties = {

    display:
      "flex",

    alignItems:
      "center",

    gap:
      9

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


const countBadge:
  React.CSSProperties = {

    minWidth:
      24,

    height:
      24,

    padding:
      "0 7px",

    borderRadius:
      999,

    background:
      "#dc2626",

    color:
      "white",

    display:
      "grid",

    placeItems:
      "center",

    fontSize:
      11,

    fontWeight:
      800

  };


const subtitle:
  React.CSSProperties = {

    margin:
      0,

    color:
      "#64748b"

  };


const actions:
  React.CSSProperties = {

    display:
      "flex",

    gap:
      8,

    flexWrap:
      "wrap"

  };


const primaryButton:
  React.CSSProperties = {

    height:
      40,

    padding:
      "0 13px",

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

    fontWeight:
      700

  };


const secondaryButton:
  React.CSSProperties = {

    height:
      40,

    padding:
      "0 13px",

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


const errorBox:
  React.CSSProperties = {

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
      15

  };


const filterBar:
  React.CSSProperties = {

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      13,

    padding:
      9,

    display:
      "flex",

    gap:
      6,

    flexWrap:
      "wrap",

    marginBottom:
      12

  };


const filterButton:
  React.CSSProperties = {

    border:
      0,

    background:
      "transparent",

    color:
      "#64748b",

    padding:
      "8px 11px",

    borderRadius:
      8,

    cursor:
      "pointer",

    fontWeight:
      600,

    fontSize:
      12

  };


const activeFilter:
  React.CSSProperties = {

    background:
      "#eff6ff",

    color:
      "#1d4ed8"

  };


const listHeader:
  React.CSSProperties = {

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    margin:
      "10px 2px",

    color:
      "#64748b",

    fontSize:
      12

  };


const unreadText:
  React.CSSProperties = {

    color:
      "#2563eb",

    fontWeight:
      700

  };


const list:
  React.CSSProperties = {

    display:
      "grid",

    gap:
      10

  };


const card:
  React.CSSProperties = {

    display:
      "flex",

    gap:
      14,

    padding:
      18,

    border:
      "1px solid #e2e8f0",

    borderRadius:
      14,

    boxSizing:
      "border-box"

  };


const iconBase:
  React.CSSProperties = {

    width:
      42,

    height:
      42,

    borderRadius:
      11,

    display:
      "grid",

    placeItems:
      "center",

    flexShrink:
      0

  };


const content:
  React.CSSProperties = {

    minWidth:
      0,

    flex:
      1

  };


const cardTop:
  React.CSSProperties = {

    display:
      "flex",

    alignItems:
      "flex-start",

    justifyContent:
      "space-between",

    gap:
      10

  };


const typeLabel:
  React.CSSProperties = {

    fontSize:
      10,

    fontWeight:
      800,

    letterSpacing:
      1,

    color:
      "#94a3b8",

    textTransform:
      "uppercase"

  };


const cardTitle:
  React.CSSProperties = {

    margin:
      "4px 0 0",

    fontSize:
      16,

    color:
      "#0f172a"

  };


const unreadDot:
  React.CSSProperties = {

    padding:
      "4px 8px",

    borderRadius:
      999,

    background:
      "#dbeafe",

    color:
      "#2563eb",

    fontSize:
      10,

    fontWeight:
      800

  };


const message:
  React.CSSProperties = {

    margin:
      "8px 0",

    color:
      "#475569",

    fontSize:
      13,

    lineHeight:
      1.6

  };


const footer:
  React.CSSProperties = {

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap:
      10,

    marginTop:
      10

  };


const timestamp:
  React.CSSProperties = {

    color:
      "#94a3b8",

    fontSize:
      11

  };


const markReadButton:
  React.CSSProperties = {

    height:
      31,

    padding:
      "0 9px",

    border:
      "1px solid #dbeafe",

    borderRadius:
      8,

    background:
      "#eff6ff",

    color:
      "#2563eb",

    display:
      "inline-flex",

    alignItems:
      "center",

    gap:
      5,

    cursor:
      "pointer",

    fontWeight:
      700,

    fontSize:
      11

  };


const muted:
  React.CSSProperties = {

    color:
      "#94a3b8",

    fontSize:
      12

  };


const emptyCard:
  React.CSSProperties = {

    minHeight:
      260,

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      16,

    display:
      "flex",

    flexDirection:
      "column",

    justifyContent:
      "center",

    alignItems:
      "center",

    gap:
      8,

    color:
      "#94a3b8"

  };