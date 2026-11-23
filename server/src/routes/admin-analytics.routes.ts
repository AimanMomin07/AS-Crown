import {
  Router
} from "express";

import {
  authenticate,
  authorize
} from "../middleware/auth.js";

import {
  getAdminAnalytics
} from "../controllers/admin-analytics.controller.js";

const router =
  Router();

router.get(
  "/",
  authenticate,
  authorize("admin"),
  getAdminAnalytics
);

export default router;
