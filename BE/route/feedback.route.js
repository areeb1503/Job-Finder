import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { addFeedback } from "../controller/feedback.controller.js";

const router = express.Router();
router.route("/add-feedback").post(verifyJWT,addFeedback)

export default router;