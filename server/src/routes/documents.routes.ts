import {
  Router
} from "express";

import {
  authenticate,
  authorize
} from "../middleware/auth.js";

import {
  getDocuments,
  getAllDocuments,
  downloadDocument,
  createDocument,
  updateDocument,
  deleteDocument
} from "../controllers/documents.controller.js";

import uploadDocument
  from "../middleware/document-upload.js";


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
  getDocuments
);


router.get(
  "/:id/download",
  authenticate,
  authorize(
    "admin",
    "resident",
    "staff",
    "security",
    "committee"
  ),
  downloadDocument
);


router.get(
  "/admin/all",
  authenticate,
  authorize(
    "admin"
  ),
  getAllDocuments
);


router.post(
  "/",
  authenticate,
  authorize(
    "admin"
  ),
  uploadDocument.single(
    "document"
  ),
  createDocument
);


router.put(
  "/:id",
  authenticate,
  authorize(
    "admin"
  ),
  updateDocument
);


router.delete(
  "/:id",
  authenticate,
  authorize(
    "admin"
  ),
  deleteDocument
);


export default router;
