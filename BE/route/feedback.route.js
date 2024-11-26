import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { addFeedback,getAllFeedback } from "../controller/feedback.controller.js";

const router = express.Router();
router.route("/add-feedback").post(verifyJWT,addFeedback)
router.route("/get-all-feedback").get(getAllFeedback)

export default router;