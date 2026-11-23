import {
  useCallback,
  useEffect,
  useState
} from "react";

import type {
  CSSProperties
} from "react";

import {
  Bell,
  Check,
  CheckCheck,
  RefreshCw
} from "lucide-react";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead
} from "../../api/notifications.api";

import type {
  Notification
} from "../../api/notifications.api";


export default function AdminNotifications() {

  const [
    items,
    setItems
  ] =
    useState<
      Notification[]
    >([]);


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


  /* =======================================================
     LOAD NOTIFICATIONS
  ======================================================= */

  const refresh =
    useCallback(
      async (
        showLoading = true
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


          const [
            notificationsResponse,
            countResponse
          ] =
            await Promise.all([

              getNotifications(),

              getUnreadNotificationCount()

            ]);


          setItems(
            notificationsResponse
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
            "Admin notifications error:",
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
      []
    );


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {

    void refresh();

  }, [
    refresh
  ]);


  /* =======================================================
     MARK ONE AS READ
  ======================================================= */

  async function handleMarkRead(
    id:
      number
  ) {

    try {

      await markNotificationRead(
        id
      );


      await refresh(
        false
      );

    } catch (
      requestError: any
    ) {

      console.error(
        "Mark notification read error:",
        requestError
      );


      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
        "Unable to mark notification as read."
      );

    }

  }


  /* =======================================================
     MARK ALL AS READ
  ======================================================= */

  async function handleMarkAllRead() {

    if (
      unreadCount ===
      0
    ) {

      return;

    }


    try {

      await markAllNotificationsRead();


      await refresh(
        false
      );

    } catch (
      requestError: any
    ) {

      console.error(
        "Mark all notifications error:",
        requestError
      );


      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
        "Unable to mark all notifications as read."
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
                    unreadCountBadge
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
              Your AS CROWN administrator notification center.
            </p>

          </div>


          {/* =================================================
              BUTTONS
          ================================================= */}

          <div
            style={
              actions
            }
          >

            <button
              type="button"

              onClick={() =>
                void refresh(
                  false
                )
              }

              disabled={
                refreshing
              }

              style={{
                ...secondaryButton,

                opacity:
                  refreshing
                    ? 0.6
                    : 1
              }}
            >

              <RefreshCw
                size={
                  16
                }
              />

              {
                refreshing
                  ? "Refreshing..."
                  : "Refresh"
              }

            </button>


            <button
              type="button"

              onClick={() =>
                void handleMarkAllRead()
              }

              disabled={
                unreadCount ===
                0
              }

              style={{
                ...primaryButton,

                opacity:
                  unreadCount ===
                  0
                    ? 0.5
                    : 1,

                cursor:
                  unreadCount ===
                  0
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
            SUMMARY
        ================================================= */}

        <div
          style={
            summary
          }
        >

          <div
            style={
              summaryIcon
            }
          >

            <Bell
              size={
                20
              }
            />

          </div>


          <div>

            <div
              style={
                summaryLabel
              }
            >
              Unread notifications
            </div>


            <strong
              style={
                summaryNumber
              }
            >
              {
                unreadCount
              }
            </strong>

          </div>

        </div>


        {/* =================================================
            LIST
        ================================================= */}

        {loading ? (

          <div
            style={
              emptyCard
            }
          >

            Loading notifications...

          </div>

        ) : items.length ===
          0 ? (

          <div
            style={
              emptyCard
            }
          >

            <Bell
              size={
                32
              }
            />

            <strong>
              No notifications yet
            </strong>

            <span
              style={
                muted
              }
            >
              New society activity will appear here.
            </span>

          </div>

        ) : (

          <div
            style={
              list
            }
          >

            {items.map(
              item => (

                <div
                  key={
                    item.id
                  }

                  style={{
                    ...card,

                    background:
                      item.is_read
                        ? "white"
                        : "#f8fbff",

                    borderColor:
                      item.is_read
                        ? "#e2e8f0"
                        : "#bfdbfe"
                  }}
                >

                  <div
                    style={
                      cardContent
                    }
                  >

                    <div
                      style={
                        cardHeader
                      }
                    >

                      <div>

                        <div
                          style={
                            typeLabel
                          }
                        >
                          {
                            item.type
                          }
                        </div>


                        <strong
                          style={
                            cardTitle
                          }
                        >
                          {
                            item.title
                          }
                        </strong>

                      </div>


                      {!item.is_read && (

                        <span
                          style={
                            newBadge
                          }
                        >
                          NEW
                        </span>

                      )}

                    </div>


                    <p
                      style={
                        message
                      }
                    >
                      {
                        item.message
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
                            item.created_at
                          ).toLocaleString(
                            "en-IN"
                          )
                        }

                      </span>


                      {!item.is_read && (

                        <button
                          type="button"

                          onClick={() =>
                            void handleMarkRead(
                              item.id
                            )
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

                          Mark read

                        </button>

                      )}

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>

  );

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
      1050,

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


const titleRow:
  CSSProperties = {

    display:
      "flex",

    alignItems:
      "center",

    gap:
      9

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


const unreadCountBadge:
  CSSProperties = {

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


const actions:
  CSSProperties = {

    display:
      "flex",

    gap:
      8,

    flexWrap:
      "wrap"

  };


const primaryButton:
  CSSProperties = {

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
  CSSProperties = {

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


const summary:
  CSSProperties = {

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      14,

    padding:
      15,

    display:
      "flex",

    alignItems:
      "center",

    gap:
      11,

    marginBottom:
      14

  };


const summaryIcon:
  CSSProperties = {

    width:
      42,

    height:
      42,

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


const summaryLabel:
  CSSProperties = {

    color:
      "#64748b",

    fontSize:
      11,

    fontWeight:
      700

  };


const summaryNumber:
  CSSProperties = {

    display:
      "block",

    marginTop:
      2,

    fontSize:
      23

  };


const list:
  CSSProperties = {

    display:
      "grid",

    gap:
      11

  };


const card:
  CSSProperties = {

    border:
      "1px solid",

    borderRadius:
      14,

    padding:
      17

  };


const cardContent:
  CSSProperties = {

    minWidth:
      0

  };


const cardHeader:
  CSSProperties = {

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "flex-start",

    gap:
      12

  };


const typeLabel:
  CSSProperties = {

    color:
      "#94a3b8",

    fontSize:
      9,

    fontWeight:
      800,

    textTransform:
      "uppercase",

    letterSpacing:
      1

  };


const cardTitle:
  CSSProperties = {

    display:
      "block",

    marginTop:
      4,

    fontSize:
      15,

    color:
      "#0f172a"

  };


const newBadge:
  CSSProperties = {

    padding:
      "4px 7px",

    borderRadius:
      999,

    background:
      "#dbeafe",

    color:
      "#2563eb",

    fontSize:
      9,

    fontWeight:
      800

  };


const message:
  CSSProperties = {

    margin:
      "8px 0",

    color:
      "#64748b",

    lineHeight:
      1.6,

    fontSize:
      13

  };


const footer:
  CSSProperties = {

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap:
      10

  };


const timestamp:
  CSSProperties = {

    color:
      "#94a3b8",

    fontSize:
      10

  };


const markReadButton:
  CSSProperties = {

    height:
      32,

    padding:
      "0 10px",

    border:
      "1px solid #dbeafe",

    borderRadius:
      8,

    background:
      "#eff6ff",

    color:
      "#1d4ed8",

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
      10

  };


const muted:
  CSSProperties = {

    color:
      "#94a3b8",

    fontSize:
      12

  };


const emptyCard:
  CSSProperties = {

    minHeight:
      250,

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      15,

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