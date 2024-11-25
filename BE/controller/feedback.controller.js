import { Feedback } from "../models/feedback.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const addFeedback = async (req, res) => {
  try {
    const { feedbackText, rating } = req.body;
    const userId = req.user._id;
    console.log(userId);
    
    if (!feedbackText || !rating) {
      throw new ApiError(400, "All fields are required.");
    }
    const feedback = await Feedback.create({
      feedbackText,
      rating,
      userId: userId,
    });
    res
      .status(200)
      .json(new ApiResponse(200, feedback, "Feedback added successfully."));
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Error in add Feedback controller";
    return res.status(statusCode).json({ success: false, statusCode, message });
  }
};

// GetAllFeedback

