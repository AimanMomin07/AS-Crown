import api from "./axios";


export type NotificationType =
  | "system"
  | "announcement"
  | "payment"
  | "complaint"
  | "visitor"
  | "security"
  | "other";


export interface Notification {

  id:
    number;

  user_id:
    number;

  title:
    string;

  message:
    string;

  type:
    NotificationType;

  is_read:
    number;

  read_at:
    string |
    null;

  created_at:
    string;

}


export async function getNotifications(
  params?: {
    type?:
      NotificationType;

    unreadOnly?:
      boolean;
  }
) {

  const response =
    await api.get(
      "/notifications",
      {
        params
      }
    );


  return response.data;

}


export async function getUnreadNotificationCount() {

  const response =
    await api.get(
      "/notifications/unread-count"
    );


  return response.data;

}


export async function markNotificationRead(
  id:
    number
) {

  const response =
    await api.patch(
      `/notifications/${id}/read`
    );


  return response.data;

}


export async function markAllNotificationsRead() {

  const response =
    await api.patch(
      "/notifications/read-all"
    );


  return response.data;

}