import {
  Router
} from "express";

import {
  authenticate
} from "../middleware/auth.js";

import {
  getMyProfile,
  updateMyProfile,
  uploadMyProfilePhoto,
  changeMyPassword
} from "../controllers/profile.controller.js";

import upload
  from "../middleware/upload.js";


const router =
  Router();


router.use(
  authenticate
);


router.get(
  "/me",
  getMyProfile
);


router.post(
  "/me/photo",
  upload.single(
    "profileImage"
  ),
  uploadMyProfilePhoto
);


router.put(
  "/me",
  updateMyProfile
);


router.put(
  "/me/password",
  changeMyPassword
);


export default router;
