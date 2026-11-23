import { Router } from "express";

import {
  authenticate,
  authorize
} from "../middleware/auth.js";

import {
  getFlats,
  getFlatById,
  createFlat,
  updateFlat,
  deleteFlat,
  getFlatStats,
  generateFlats
} from "../controllers/flats.controller.js";

const router = Router();


/* =========================================================
   FLAT STATISTICS
   IMPORTANT: keep /stats before /:id
========================================================= */

router.get(
  "/stats",
  authenticate,
  authorize("admin"),
  getFlatStats
);


/* =========================================================
   AUTO GENERATE
   IMPORTANT: keep /generate before /:id
========================================================= */

router.post(
  "/generate",
  authenticate,
  authorize("admin"),
  generateFlats
);


/* =========================================================
   GET ALL
========================================================= */

router.get(
  "/",
  authenticate,
  authorize("admin"),
  getFlats
);


/* =========================================================
   CREATE
========================================================= */

router.post(
  "/",
  authenticate,
  authorize("admin"),
  createFlat
);


/* =========================================================
   GET ONE
========================================================= */

router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  getFlatById
);


/* =========================================================
   UPDATE
========================================================= */

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  updateFlat
);


/* =========================================================
   DEACTIVATE
========================================================= */

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteFlat
);


export default router;