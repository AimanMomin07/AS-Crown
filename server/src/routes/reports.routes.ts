import {
  Router
} from "express";

import {
  authenticate,
  authorize
} from "../middleware/auth.js";

import {
  getAdminReports
} from "../controllers/reports.controller.js";


const router =
  Router();


router.get(
  "/",
  authenticate,
  authorize("admin"),
  getAdminReports
);


export default router;