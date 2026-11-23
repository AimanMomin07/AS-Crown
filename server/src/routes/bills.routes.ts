import {
  Router
} from "express";

import {
  authenticate,
  authorize
} from "../middleware/auth.js";

import {
  getBills,
  getBillById,
  createBill,
  generateBills
} from "../controllers/bills.controller.js";


const router =
  Router();


router.use(
  authenticate,
  authorize("admin")
);


router.get(
  "/",
  getBills
);


router.post(
  "/generate",
  generateBills
);


router.post(
  "/",
  createBill
);


router.get(
  "/:id",
  getBillById
);


export default router;