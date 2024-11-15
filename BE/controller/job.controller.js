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
          results_per_page: 10,
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
