import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { createRequire } from "module";
import Groq from "groq-sdk";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

import axios from "axios";
export const postJob = async (req, res) => {
  try {
    const { title, location, company, description, job_link, skillKeywords } =
      req.body;
    if (!title || !location || !company || !description || !job_link) {
      throw new ApiError(400, "Please fill in all fields");
    }
    const userId = req.user._id;
    const existingJob = await Job.findOne({ job_link });
    if (existingJob) {
      throw new ApiError(400, "Job already exists");
    }
    const formattedSkills = Array.isArray(skillKeywords)
      ? skillKeywords.map((skill) => skill.toLowerCase().trim()) // Already an array, process normally
      : typeof skillKeywords === "string"
      ? skillKeywords.split(",").map((skill) => skill.toLowerCase().trim()) // Convert comma-separated string to array
      : [];

    if (formattedSkills.length === 0) {
      return res
        .status(400)
        .json({ message: "skillKeywords must be a non-empty array." });
    }
    const job = await Job.create({
      title,
      location,
      company,
      description,
      job_link,
      created_by: userId,
      skillKeywords: formattedSkills,
    });
    await job.save();
    return res
      .status(200)
      .json(new ApiResponse(200, job, "New Job created successfully."));
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Error in postJob controller";
    return res.status(statusCode).json({ success: false, statusCode, message });
  }
};

export const getResumetext = async (req, res) => {
  try {
    const userResumeUrl = req.body.user?.resume;

    if (!userResumeUrl) {
      return res
        .status(400)
        .json({ message: "No resume URL found for the user" });
    }

    const response = await axios.get(userResumeUrl, {
      responseType: "arraybuffer",
    });

    const pdfData = await pdfParse(response.data);
    const resumeText = pdfData.text;
    return res
      .status(200)
      .json(
        new ApiResponse(200, resumeText, "Resume text extracted successfully")
      );
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Error in resume text controller";
    return res.status(statusCode).json({ success: false, statusCode, message });
  }
};
export const getAllJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    // Fetch all jobs and populate 'created_by' and 'likes' fields
    const jobs = await Job.find({
      $or: [
        { created_by: userId }, // Jobs created by the user
        { likes: userId }, // Jobs liked by the user
      ],
    })
      .populate("created_by", "fullname email") // Populate creator's details
      .populate("likes", "fullname email"); // Populate user details who liked the job

    res.status(200).json({
      success: true,

      data: jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs. Please try again later.",
    });
  }
};
export const extractJobPosting = async (req, res) => {
  try {
    const userResumeUrl = req.user?.resume;

    if (!userResumeUrl) {
      return res
        .status(400)
        .json({ message: "No resume URL found for the user" });
    }

    const response = await axios.get(userResumeUrl, {
      responseType: "arraybuffer",
    });

    const pdfData = await pdfParse(response.data);
    const resumeText = pdfData.text;

    const skills = await extractSkills(resumeText);

    const adzunaJobs = await getJobPostingsFromAdzuna(skills);

    const localJobs = await getJobPostingsFromDatabase(skills);

    const combinedJobs = [...localJobs, ...adzunaJobs];

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          combinedJobs,
          "Job postings retrieved successfully"
        )
      );
  } catch (err) {
    console.error("Failed to retrieve job postings", err);
    return res
      .status(500)
      .json({ message: "Error fetching job postings from Adzuna" });
  }
};

const extractSkills = async (resumeText) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: [
        {
          role: "user",
          content: `Extract job-related technical skills from the following resume and return them as a single comma-separated string with no extra text: ${resumeText}`
        }
      ]
    });

    const skills = result.choices[0].message.content;
    return skills.split(",").map((skill) => skill.toLowerCase().trim());

  } catch (error) {
    console.error("Error extracting skills:", error);
    throw new Error("Skill extraction failed");
  }
};
const getJobPostingsFromAdzuna = async (skills) => {
  try {
    const adzunaAppId = process.env.ADZUNA_APP_ID;
    const adzunaAppKey = process.env.ADZUNA_APP_KEY;
    const encodedSkills = Array.isArray(skills) ? skills.join(",") : skills;
    const response = await axios.get(
      `http://api.adzuna.com/v1/api/jobs/in/search/1`,
      {
        params: {
          app_id: adzunaAppId,
          app_key: adzunaAppKey,
          what_or: encodedSkills,
          results_per_page: 20,
        },
      }
    );

    return response.data.results;
  } catch (error) {
    console.error("Error fetching job postings from Adzuna:", error);
    throw new Error("Failed to retrieve job postings");
  }
};
const getJobPostingsFromDatabase = async (skills) => {
  try {

    // Normalize skills into an array of keywords
    const skillKeywords = Array.isArray(skills)
      ? skills.map((skill) => skill.toLowerCase().trim())
      : typeof skills === "string"
      ? skills.split(",").map((skill) => skill.toLowerCase().trim())
      : [];


    // Return empty array if no skills are provided
    if (skillKeywords.length === 0) {
      console.warn("No valid skills provided for searching jobs.");
      return [];
    }

    // Fetch jobs from the local database
    const job = await Job.find({
      skillKeywords: { $in: skillKeywords },
    });

  
    return job;
  } catch (error) {
    console.error("Error fetching job postings from database:", error);
    throw new Error("Failed to retrieve job postings from database");
  }
};
export const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res
        .status(400)
        .json({ success: false, message: "Job ID is required." });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: "Job not found." });
    }

    if (job.created_by.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this job.",
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: "Job deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteJob controller:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
// job.controller.js

export const likeUnlikeJob = async (req, res) => {
  try {
    const userId = req.user._id;
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const isLiked = job.likes.includes(userId);

    if (isLiked) {
      await Job.updateOne({ _id: jobId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedJobs: jobId } });
    } else {
      await Job.updateOne({ _id: jobId }, { $push: { likes: userId } });
      await User.updateOne({ _id: userId }, { $push: { likedJobs: jobId } });
    }

    // Return updated liked jobs list so frontend stays in sync
    const updatedUser = await User.findById(userId).select("likedJobs");
    return res.status(200).json({
      message: isLiked ? "Job unliked successfully" : "Job liked successfully",
      likedJobs: updatedUser.likedJobs,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error toggling local job like" });
  }
};

//  Adzuna job like/unlike
export const likeUnlikeAdzunaJob = async (req, res) => {
  try {
    const userId = req.user._id;
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isLiked = user.AdzunaLikedJobs.includes(jobId);

    if (isLiked) {
      await User.updateOne({ _id: userId }, { $pull: { AdzunaLikedJobs: jobId } });
    } else {
      await User.updateOne({ _id: userId }, { $push: { AdzunaLikedJobs: jobId } });
    }

    const updatedUser = await User.findById(userId).select("AdzunaLikedJobs");
    return res.status(200).json({
      message: isLiked ? "Job unliked successfully" : "Job liked successfully",
      likedJobs: updatedUser.AdzunaLikedJobs,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error toggling Adzuna job like" });
  }
};

// Get all liked jobs (both local and adzuna IDs)
export const getAllLikedJobs = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("likedJobs AdzunaLikedJobs");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Liked jobs retrieved successfully",
      localLikedJobs: user.likedJobs || [],
      adzunaLikedJobs: user.AdzunaLikedJobs || [],
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching liked jobs" });
  }
};
