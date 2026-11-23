import { Router } from "express";

import {
  authenticate,
  authorize
} from "../middleware/auth.js";

import {
  getUsers,
  getUserById,
  createUser,
  updateUserStatus
} from "../controllers/admin-users.controller.js";

import {
  updateAdminUser
} from "../controllers/admin-users.controller.js";

import upload
  from "../middleware/upload.js";

import {
  uploadAdminProfileImage
} from "../controllers/admin-users.controller.js";

const router =
  Router();


/*
|--------------------------------------------------------------------------
| ALL ROUTES REQUIRE ADMIN
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/profile-image",
  authenticate,
  authorize("admin"),
  upload.single("profile"),
  uploadAdminProfileImage
);

router.use(
  authenticate,
  authorize("admin")
);


/*
|--------------------------------------------------------------------------
| GET ALL USERS
|--------------------------------------------------------------------------
|
| GET /api/admin/users
|
| Examples:
|
| /api/admin/users
| /api/admin/users?search=aiman
| /api/admin/users?role=resident
| /api/admin/users?status=active
| /api/admin/users?page=1&limit=20
|
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getUsers
);


/*
|--------------------------------------------------------------------------
| GET USER
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  getUserById
);


/*
|--------------------------------------------------------------------------
| CREATE USER
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  createUser
);


/*
|--------------------------------------------------------------------------
| UPDATE USER STATUS
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  updateAdminUser
);

router.patch(
  "/:id/status",
  updateUserStatus
);


export default router;