import { Router } from "express";

import {
  authenticate,
  authorize
} from "../middleware/auth.js";

import {
  getDashboardStats
} from "../controllers/admin.controller.js";


const router =
  Router();


/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD
|--------------------------------------------------------------------------
*/

router.get(
  "/dashboard",
  authenticate,
  authorize("admin"),
  getDashboardStats
);


export default router;