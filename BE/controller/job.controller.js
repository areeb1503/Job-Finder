import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

import { GoogleGenerativeAI } from "@google/generative-ai";
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
    const job = await Job.create({
      title,
      location,
      company,
      description,
      job_link,
      created_by: userId,
      skillKeywords,
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
export const getResumetext=async(req,res)=>{
  try {
    const userResumeUrl = req.body.user?.resume;
      console.log("User resume URL:", userResumeUrl);
  
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

}
export const getAllJobs = async (req, res) => {
  try {
      // Fetch all jobs and populate 'created_by' and 'likes' fields
      const jobs = await Job.find()
          .populate("created_by", "fullname email") // Populate creator's details
          .populate("likes", "fullname email");    // Populate user details who liked the job

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
    console.log("User resume URL:", userResumeUrl);

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

    console.log("Extracted Skills:", skills);
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
const getJobPostingsFromAdzuna = async (skills) => {
  try {
    const adzunaAppId = process.env.ADZUNA_APP_ID;
    const adzunaAppKey = process.env.ADZUNA_APP_KEY;
    const encodedSkills = skills;

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
    console.log("Skills type:", typeof skills);
    const skillKeywords =typeof skills === "string"? skills.split(" ").map((skill) => skill.toLowerCase()) : Array.isArray(skills)? skills.map((skill) => skill.toLowerCase()) : [];
    const jobs = await Job.find({
      skills: { $in: skillKeywords },
    });

    return jobs;
  } catch (error) {
    console.error("Error fetching job postings from database:", error);
    throw new Error("Failed to retrieve job postings from database");
  }
};

export const toggleAdzunaLikedJob = async (req, res) => {
  const { userId, jobId } = req.body;  // Expecting userId and jobId in the request body

  // Check if both userId and jobId are provided
  if (!userId || !jobId) {
      return res.status(400).json({ message: "User ID and Job ID are required" });
  }

  try {
      // Find the user by userId
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      // Check if the job is already in the AdzunaLikedJobs array
      const jobIndex = user.AdzunaLikedJobs.indexOf(jobId);

      if (jobIndex === -1) {
          // If the job is not in the array, add it (like the job)
          user.AdzunaLikedJobs.push(jobId);
          await user.save();
          return res.status(200).json({ message: "Job liked successfully", AdzunaLikedJobs: user.AdzunaLikedJobs });
      } else {
          // If the job is already liked, remove it (unlike the job)
          user.AdzunaLikedJobs.splice(jobIndex, 1);
          await user.save();
          return res.status(200).json({ message: "Job unliked successfully", AdzunaLikedJobs: user.AdzunaLikedJobs });
      }
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
  }
};

export const isLiked = async (req, res) => {
  const { userId, jobId } = req.body; // Expecting userId and jobId in the request body

  // Validate input
  if (!userId || !jobId) {
      return res.status(400).json({ message: "User ID and Job ID are required" });
  }

  try {
      // Find the user by userId
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      // Check if the jobId exists in the AdzunaLikedJobs array
      const isJobLiked = user.AdzunaLikedJobs.includes(jobId);

      // Respond with the like status
      return res.status(200).json({ 
          message: isJobLiked ? "Job is liked" : "Job is not liked", 
          isLiked: isJobLiked 
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAdzunaLikedJobs = async (req, res) => {
  const { userId } = req.body; // Expecting userId in the request body

  // Validate input
  if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
  }

  try {
      // Find the user by userId
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      // Retrieve all liked jobs from AdzunaLikedJobs
      const likedJobs = user.AdzunaLikedJobs;

      return res.status(200).json({ 
          message: "Liked jobs retrieved successfully", 
          likedJobs 
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
  }
};