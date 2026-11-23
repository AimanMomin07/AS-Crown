import {
  Router
} from "express";

import {
  authenticate,
  authorize
} from "../middleware/auth.js";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification
} from "../controllers/notifications.controller.js";


const router =
  Router();


router.get(
  "/",
  authenticate,
  authorize(
    "admin",
    "resident",
    "staff",
    "security",
    "committee"
  ),
  getNotifications
);


router.get(
  "/unread-count",
  authenticate,
  authorize(
    "admin",
    "resident",
    "staff",
    "security",
    "committee"
  ),
  getUnreadNotificationCount
);


router.patch(
  "/read-all",
  authenticate,
  authorize(
    "admin",
    "resident",
    "staff",
    "security",
    "committee"
  ),
  markAllNotificationsRead
);


router.patch(
  "/:id/read",
  authenticate,
  authorize(
    "admin",
    "resident",
    "staff",
    "security",
    "committee"
  ),
  markNotificationRead
);


router.post(
  "/",
  authenticate,
  authorize(
    "admin"
  ),
  createNotification
);


export default router;