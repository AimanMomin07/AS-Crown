import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getPayments, recordPayment, updatePaymentStatus } from "../controllers/payments.controller.js";

const router = Router();
router.use(authenticate, authorize("admin"));
router.get("/", getPayments);
router.post("/", recordPayment);
router.patch("/:id/status", updatePaymentStatus);
export default router;
