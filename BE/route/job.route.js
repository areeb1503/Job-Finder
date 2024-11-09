import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { postJob, likeUnlikeJobs,extractJobPosting } from "../controller/job.controller.js";

const router = express.Router();

router.route("/post-job").post(verifyJWT, postJob);
router.route("/like-job/:id").post(verifyJWT, likeUnlikeJobs);
router.route("/extract-skills").post(verifyJWT,extractJobPosting);

export default router;
