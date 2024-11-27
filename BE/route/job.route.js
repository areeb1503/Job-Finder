import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  postJob,
  likeUnlikeJobs,
  extractJobPosting,
  getResumetext,
  toggleAdzunaLikedJob,
  isLiked,
  getAdzunaLikedJobs,
  getAllJobs,
  deleteJob,
} from "../controller/job.controller.js";

const router = express.Router();

router.route("/post-job").post(verifyJWT, postJob);
router.route("/like-job/:id").post(verifyJWT, likeUnlikeJobs);
router.route("/extract-jobs").post(verifyJWT, extractJobPosting);
router.route("/get-resume-text").post(verifyJWT, getResumetext);
router.route("/toggle-like-adzuna").post(verifyJWT, toggleAdzunaLikedJob);
router.route("/is-adzuna-liked").post(verifyJWT, isLiked);
router.route("/get-adzuna-liked").post(verifyJWT, getAdzunaLikedJobs);
router.route("/get-all-jobs").post(verifyJWT, getAllJobs);
router.route("/:jobId").delete(verifyJWT, deleteJob);
export default router;
