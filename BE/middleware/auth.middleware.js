import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";

export const verifyJWT = async (req, res, next) => {
  try {
    // Retrieve the token either from the cookie or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "").trim();

    // If no token is found, throw an error
    if (!token) {
      throw new ApiError(401, "Unauthorized request: No token provided");
    }

    // Try to verify the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedToken) {
      throw new ApiError(401, "Unauthorized request: Invalid token");
    }

    // Find the user associated with the token
    const user = await User.findById(decodedToken?.id).select("-password -refreshToken");

    // If no user is found, throw an error
    if (!user) {
      throw new ApiError(401, "Unauthorized request: User not found for the given token");
    }

    // Attach the user to the request object
    req.user = user;
    next();
  } catch (error) {
    // Check for different types of errors and handle accordingly

    // Token verification failure (JWT errors)
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ApiError(401, "Unauthorized request: Invalid or expired token"));
    }

    // Token signature issues
    if (error instanceof jwt.NotBeforeError) {
      return next(new ApiError(401, "Unauthorized request: Token not active yet"));
    }

    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError(401, "Unauthorized request: Token has expired"));
    }

    // Database related error
    if (error.name === 'MongoError') {
      return next(new ApiError(500, "Server error: Database issue"));
    }

    // Catch all other errors
    return next(new ApiError(401, error.message || "Invalid Access Token"));
  }
};