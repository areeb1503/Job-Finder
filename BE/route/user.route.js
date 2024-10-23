import express from "express";
import { register } from "../controller/user.controller.js";
import{uploadMiddleware}from "../middleware/multer.middleware.js";


const router = express.Router();

router.route("/register").post(
    uploadMiddleware,
    register
)
export default router;