import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
export const postJob = async (req, res) => {
  try {
    const { title, location, company, description, job_link } = req.body;
    if (!title || !location || !company || !description || !job_link) {
      throw new ApiError(400, "Please fill in all fields");
    }
    const userId = req.user._id;
    const existingJob = await Job.findOne({ job_link });
    if (existingJob) {
      throw new ApiError(400, "Job already exists");
    }
    const job = await Job.create({
      title,
      location,
      company,
      description,
      job_link,
      created_by: userId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, job, "New Job created successfully."));
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Error in postJob controller";
    return res.status(statusCode).json({ success: false, statusCode, message });
  }
};
export const likeUnlikeJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      throw new ApiError(404, "Job not found");
    }
    const isLiked = job.likes.includes(userId);

    // unlike
    if (isLiked) {
      await Job.updateOne({ _id: jobId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedJobs: jobId } });
      return res
        .status(200)
        .json(new ApiResponse(200, "Post unliked successfully"));
    }
    // like
    else {
      await Job.updateOne({ _id: jobId }, { $push: { likes: userId } });
      await User.updateOne({ _id: userId }, { $push: { likedJobs: jobId } });
      return res
        .status(200)
        .json(new ApiResponse(200, "Post liked successfully"));
    }
  } catch (error) {
    // const statusCode = error.statusCode || 500;
    // const message = error.message || "Error in postJob controller";
    // return res.status(statusCode).json({ success: false, statusCode, message });
    throw new ApiError(500, "Error in like post controller");
  }
};

export const extractJobPosting = async (req, res) => {
  try {
    const userResumeUrl = req.user?.resume;
    console.log("User resume URL:", userResumeUrl);

    if (!userResumeUrl) {
      return res
        .status(400)
        .json({ message: "No resume URL found for the user" });
    }

    // Fetch the PDF file from Cloudinary
    const response = await axios.get(userResumeUrl, {
      responseType: "arraybuffer",
    });

    // Parse the PDF content using pdf-parse
    const pdfData = await pdfParse(response.data);
    const resumeText = pdfData.text;

    // Extract skills from the parsed resume text
    const skills = await extractSkills(resumeText);

    console.log("Extracted Skills:", skills);
    return res
      .status(200)
      .json(new ApiResponse(200, skills, "Skills extracted successfully"));
  } catch (err) {
    console.error("Error Extracting Skills:", err);
    return res
      .status(500)
      .json({ message: "Error extracting skills from resume" });
  }
};

// Function to extract skills from the parsed resume text
const extractSkills = async (resumeText) => {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate one line string separated by spaces of job-related skills from the following resume: ${resumeText};`;
    const result = await model.generateContent(prompt);
    const skills = result.response.text();
    return skills;
  } catch (error) {
    console.error("Error extracting skills:", error);
    throw new Error("Skill extraction failed");
  }
};
