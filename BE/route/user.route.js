import express from "express";
import {
  register,
  login,
  logout,
  refreshAccessToken,
  updateUserProfile,
  updatePassword,
  getCurrentUser
} from "../controller/user.controller.js";
import { uploadMiddleware } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/register").post(uploadMiddleware, register);
router.route("/login").post(login);
router.route("/logout").post( logout);
router.route("/generate-token").post(refreshAccessToken);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateUserProfile);
router.route("/update-password").post(verifyJWT,updatePassword)
export default router;


