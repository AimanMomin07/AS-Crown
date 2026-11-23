import {
  Router
} from "express";

import {
  authenticate,
  authorize
} from "../middleware/auth.js";

import {
  getMaintenanceRates,
  upsertMaintenanceRate,
  getMaintenanceOverrides,
  upsertMaintenanceOverride,
  deleteMaintenanceOverride
} from "../controllers/maintenance-rates.controller.js";


const router =
  Router();


router.use(
  authenticate,
  authorize("admin")
);


router.get(
  "/",
  getMaintenanceRates
);


router.put(
  "/",
  upsertMaintenanceRate
);


router.get(
  "/overrides",
  getMaintenanceOverrides
);


router.put(
  "/overrides/:flatId",
  upsertMaintenanceOverride
);


router.delete(
  "/overrides/:flatId",
  deleteMaintenanceOverride
);


export default router;