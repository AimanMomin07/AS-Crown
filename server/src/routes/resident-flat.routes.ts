import {
  Router
} from "express";

import {
  authenticate,
  authorize
} from "../middleware/auth.js";

import {
  assignResidentFlat,
  removeResidentFlat,
  removeResident
} from "../controllers/resident-flat.controller.js";


const router =
  Router();


router.use(
  authenticate,
  authorize("admin")
);


router.put(
  "/:userId/flat",
  assignResidentFlat
);


router.delete(
  "/:userId/flat",
  removeResidentFlat
);


router.delete(
  "/:userId",
  removeResident
);


export default router;