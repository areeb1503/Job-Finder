import express from "express";
import { register,login,logout } from "../controller/user.controller.js";
import{uploadMiddleware}from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = express.Router();

router.route("/register").post(
    uploadMiddleware,
    register
)
router.route("/login").post(
    login
)
router.route("/logout").post(
    verifyJWT,
    logout
    
)
export default router;