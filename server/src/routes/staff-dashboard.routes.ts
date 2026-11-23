import {
  Router
} from "express";

import {
  authenticate,
  authorize
} from "../middleware/auth.js";

import {
  getStaffDashboard
} from "../controllers/staff-dashboard.controller.js";


const router =
  Router();


router.get(
  "/",
  authenticate,
  authorize(
    "staff"
  ),
  getStaffDashboard
);


export default router;
