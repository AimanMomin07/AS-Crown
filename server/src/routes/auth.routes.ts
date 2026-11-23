import {
  Router
} from "express";

import {
  register,
  login,
  getMe,
  resetPasswordWithFirebase
} from "../controllers/auth.controller.js";

import {
  authenticate
} from "../middleware/auth.js";


const router =
  Router();


/*
|--------------------------------------------------------------------------
| PUBLIC AUTH ROUTES
|--------------------------------------------------------------------------
*/

router.post(
  "/register",
  register
);


router.post(
  "/login",
  login
);


router.post(
  "/forgot-password/firebase-reset",
  resetPasswordWithFirebase
);


/*
|--------------------------------------------------------------------------
| PROTECTED AUTH ROUTES
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  authenticate,
  getMe
);


export default router;