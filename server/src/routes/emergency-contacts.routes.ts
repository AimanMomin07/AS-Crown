import {
  Router
} from "express";

import {
  authenticate,
  authorize
} from "../middleware/auth.js";

import {
  getEmergencyContacts,
  getAllEmergencyContacts,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact
} from "../controllers/emergency-contacts.controller.js";


const router =
  Router();


router.get(
  "/",
  authenticate,
  authorize(
    "admin",
    "resident",
    "staff",
    "security",
    "committee"
  ),
  getEmergencyContacts
);


router.get(
  "/admin/all",
  authenticate,
  authorize(
    "admin"
  ),
  getAllEmergencyContacts
);


router.post(
  "/",
  authenticate,
  authorize(
    "admin"
  ),
  createEmergencyContact
);


router.put(
  "/:id",
  authenticate,
  authorize(
    "admin"
  ),
  updateEmergencyContact
);


router.delete(
  "/:id",
  authenticate,
  authorize(
    "admin"
  ),
  deleteEmergencyContact
);


export default router;
