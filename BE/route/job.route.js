import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  postJob,
  likeUnlikeJob,
  likeUnlikeAdzunaJob,
  getAllLikedJobs,
  extractJobPosting,
  getResumetext,
  getAllJobs,
  deleteJob,
  
} from "../controller/job.controller.js";

const router = express.Router();

router.route("/post-job").post(verifyJWT, postJob);
router.route("/extract-jobs").post(verifyJWT, extractJobPosting);
router.route("/get-resume-text").post(verifyJWT, getResumetext);
router.route("/get-all-jobs").post(verifyJWT, getAllJobs);
router.route("/:jobId").delete(verifyJWT, deleteJob);
router.post("/like-local",   verifyJWT, likeUnlikeJob);
router.post("/like-adzuna",  verifyJWT, likeUnlikeAdzunaJob);
router.get("/liked-jobs",    verifyJWT, getAllLikedJobs);
export default router;
