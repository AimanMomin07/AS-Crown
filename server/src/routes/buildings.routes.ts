import { Router } from "express";

import {
  authenticate,
  authorize
} from "../middleware/auth.js";

import {
  getBuildings,
  getBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding
} from "../controllers/buildings.controller.js";

const router = Router();


// Anyone authenticated with admin access
// can manage buildings.

router.get(
  "/",
  authenticate,
  authorize("admin"),
  getBuildings
);

router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  getBuildingById
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  createBuilding
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  updateBuilding
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteBuilding
);

export default router;