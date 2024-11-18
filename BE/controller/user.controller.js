import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";

import bcrypt from "bcryptjs";
import { uploadOnCloudinary } from "../utils/uploadThing.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating access and refresh tokens");
  }
};
const register = async (req, res) => {
  try {
    console.log("Registering user...");
    const { fullname, email, phoneNumber, password, role, company } = req.body;

    // Check for missing fields
    if (!fullname || !email || !phoneNumber || !password || !role) {
      throw new ApiError(400, "Please fill in all fields");
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      console.log(`User already exists: ${email} or ${phoneNumber}`);
      throw new ApiError(400, "User already exists");
    }

    // Handle file uploads
    let resumeUpload = null;
    if (role === "student" && req.files?.resume?.[0]) {
      console.log("Uploading resume...");
      const resumeFile = req.files.resume[0].path;
      resumeUpload = await uploadOnCloudinary(resumeFile);
    }

    let profilePhotoUpload = null;
    if (req.files?.profilePhoto?.[0]) {
      console.log("Uploading profile photo...");
      const profilePhotoFile = req.files.profilePhoto[0].path;
      profilePhotoUpload = await uploadOnCloudinary(profilePhotoFile);
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      resume: resumeUpload?.url || "",
      profilePhoto: profilePhotoUpload?.url || "",
      company: role === "recruiter" ? company : null,
    });
    console.log("User created:", user);

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // Set tokens and return response
    const createdUser = await User.findById(user._id).select("-password");
    const options = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    };

    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, { user: createdUser, accessToken, refreshToken }, "User registered successfully"));
  } catch (error) {
    console.error("Error in register controller:", error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "Error in register controller";
    return res.status(statusCode).json({ success: false, statusCode, message });
  }
};



const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, "Something is missing");
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User does not exists");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    // if (role != user.role) {
    //   throw new ApiError(403, "Unauthorized Access");
    // } // No need for this since role field is not there in the login form.

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "User Logged In Successfully."
        )
      );
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal server error";
    return res.status(statusCode).json({ success: false, statusCode, message });
  }
};
const logout = async (req, res) => {
  // On client, also delete the accessToken
  await User.findByIdAndUpdate(
    req.user._id,

    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out sucessfully"));
};
const refreshAccessToken = async (req, res) => {
  const incomingRefreshtoken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshtoken) {
    throw new ApiError(401, "Unauthorised request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshtoken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken.id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }
    if (incomingRefreshtoken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired ");
    }
    const { newRefreshToken, accessToken } =
      await generateAccessAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: user,
            accessToken: accessToken,
            // refreshToken: newRefreshToken,
          },
          "Access Token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
};
const getCurrentUser = async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
};
const updateUserProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber } = req.body;
    if (!(fullname || email || phoneNumber)) {
      throw new ApiError(400, "Fileld is required for updation");
    }
    const userId = await User.findById(req.user?._id);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          fullname,
          email,
          phoneNumber,
        },
      },
      { new: true }
    ).select("-password ");
    console.log(user);
    return res
      .status(200)
      .json(new ApiResponse(200, user, "User Profile updated successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      "Error in updateUserProfile controller",
      error.message
    );
  }
};
const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Please provide old and new password");
  }
  try {
    const user = await User.findById(req.user._id);
    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid old password");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save({ validateBeforeSave: false });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password updated successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      "Error in updatePassword controller",
      error.message
    );
  }
};
export {
  register,
  login,
  generateAccessAndRefreshToken,
  logout,
  refreshAccessToken,
  updateUserProfile,
  updatePassword,
  getCurrentUser,
};
