
import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  Bell,
  CheckCheck,
  RefreshCw
} from "lucide-react";

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead
} from "../../api/notifications.api";

import type {
  Notification
} from "../../api/notifications.api";

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


  const refresh =
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


          const [
            notificationResponse,
            countResponse
          ] =
            await Promise.all([

              getNotifications(),

              getUnreadNotificationCount()

            ]);


          setItems(
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
          requestError: unknown
        ) {

          console.error(
            requestError
          );


          setError(getErrorMessage(requestError, "Unable to load notifications."));

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


  useEffect(() => {

    void refresh();

  }, [
    refresh
  ]);


  async function markRead(
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
      requestError: unknown
    ) {

      console.error(
        requestError
      );


      setError(getErrorMessage(requestError, "Unable to mark notification as read."));

    }

  }


  async function markAllRead() {

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
      requestError: unknown
    ) {

      console.error(
        requestError
      );


      setError(getErrorMessage(requestError, "Unable to mark notifications as read."));

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


            <h1
              style={
                title
              }
            >
              Notifications
            </h1>


            <p
              style={
                subtitle
              }
            >
              Your AS CROWN notification center.
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
                void refresh(
                  false
                )
              }

              disabled={
                refreshing
              }

              style={
                secondary
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
                void markAllRead()
              }

              disabled={
                unreadCount ===
                0
              }

              style={
                primary
              }
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


        {error && (

          <div
            style={
              errorBox
            }
          >
            {error}
          </div>

        )}


        <div
          style={
            summary
          }
        >

          <Bell
            size={
              18
            }
          />

          <strong>
            {
              unreadCount
            }
          </strong>

          <span>
            unread notifications
          </span>

        </div>


        {loading ? (

          <div
            style={
              empty
            }
          >
            Loading notifications...
          </div>

        ) : items.length ===
          0 ? (

          <div
            style={
              empty
            }
          >

            No notifications yet.

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

                    opacity:
                      item.is_read
                        ? 0.7
                        : 1
                  }}
                >

                  <div>

                    <strong>
                      {
                        item.title
                      }
                    </strong>


                    <p
                      style={
                        message
                      }
                    >
                      {
                        item.message
                      }
                    </p>


                    <small
                      style={
                        timestamp
                      }
                    >

                      {
                        item.type
                      }

                      {" • "}

                      {
                        new Date(
                          item.created_at
                        ).toLocaleString(
                          "en-IN"
                        )
                      }

                    </small>

                  </div>


                  {!item.is_read && (

                    <button
                      type="button"

                      onClick={() =>
                        void markRead(
                          item.id
                        )
                      }

                      style={
                        readButton
                      }
                    >

                      Mark read

                    </button>

                  )}

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>

  );

}


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
      1000,

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
      15,

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


const title:
  React.CSSProperties = {

    margin:
      "5px 0",

    fontSize:
      30

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
      8

  };


const primary:
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
      40,

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
  React.CSSProperties = {

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


const summary:
  React.CSSProperties = {

    background:
      "#eff6ff",

    color:
      "#1d4ed8",

    borderRadius:
      12,

    padding:
      13,

    display:
      "flex",

    alignItems:
      "center",

    gap:
      7,

    marginBottom:
      15

  };


const list:
  React.CSSProperties = {

    display:
      "grid",

    gap:
      12

  };


const card:
  React.CSSProperties = {

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      14,

    padding:
      18,

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "flex-start",

    gap:
      15

  };


const message:
  React.CSSProperties = {

    margin:
      "6px 0",

    color:
      "#64748b",

    lineHeight:
      1.6

  };


const timestamp:
  React.CSSProperties = {

    color:
      "#94a3b8"

  };


const readButton:
  React.CSSProperties = {

    border:
      "1px solid #dbeafe",

    borderRadius:
      8,

    background:
      "#eff6ff",

    color:
      "#1d4ed8",

    padding:
      "8px 11px",

    cursor:
      "pointer",

    fontWeight:
      700,

    whiteSpace:
      "nowrap"

  };


const empty:
  React.CSSProperties = {

    background:
      "white",

    padding:
      50,

    borderRadius:
      16,

    color:
      "#94a3b8",

    textAlign:
      "center",

    border:
      "1px solid #e2e8f0"

  };