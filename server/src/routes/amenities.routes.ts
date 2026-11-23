import { Router } from "express";

import { authenticate, authorize } from "../middleware/auth.js";
import {
  getAmenities,
  createAmenity,
  updateAmenity,
  deleteAmenity
} from "../controllers/amenities.controller.js";
import {
  getAvailableSlots,
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings
} from "../controllers/amenity-bookings.controller.js";

const router = Router();

router.use(authenticate);

// Amenity catalog
router.get("/", getAmenities);
router.post("/", authorize("admin"), createAmenity);
router.patch("/:id", authorize("admin"), updateAmenity);
router.delete("/:id", authorize("admin"), deleteAmenity);

// Availability + bookings
router.get("/:amenityId/slots", getAvailableSlots);
router.post("/bookings", authorize("resident", "committee"), createBooking);
router.get("/bookings/mine", authorize("resident", "committee"), getMyBookings);
router.get("/bookings/all", authorize("admin"), getAllBookings);
router.patch("/bookings/:id/cancel", authorize("admin", "resident", "committee"), cancelBooking);

export default router;
