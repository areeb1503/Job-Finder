import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { v2 as cloudinary } from "cloudinary";

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
    const { fullname, email, phoneNumber, password, role, company } = req.body;

    // Check for missing fields
    if (!fullname || !email || !phoneNumber || !password || !role) {
      throw new ApiError(400, "Please fill in all fields");
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });
    if (existingUser) {
      throw new ApiError(400, "User already exists");
    }

    // Handle file uploads
    let resumeUpload = null;
    if (role === "student" && req.files?.resume?.[0]) {
      const resumeFile = req.files.resume[0].path;
      resumeUpload = await uploadOnCloudinary(resumeFile);
    }

    let profilePhotoUpload = null;
    if (req.files?.profilePhoto?.[0]) {
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

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

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
      .json(
        new ApiResponse(
          200,
          { user: createdUser, accessToken, refreshToken },
          "User registered successfully"
        )
      );
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

    

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password "
    );

    const options = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "Lax",
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
    sameSite: "Lax",
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
      sameSite: "Lax",
    };
    return res
      .status(200)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: user,
            accessToken: accessToken,
          },
          "Access Token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
};
const getCurrentUser = async (req, res) => {
  try {
    // req.user comes from verifyJWT middleware
    const user = await User.findById(req.user.id).select("-password");
    

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};
const updateUserProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber } = req.body;

    let { profilePhoto } = req.body;
    if (!fullname || !email || !phoneNumber) {
      throw new ApiError(400, "Field is required for updation");
    }
    const user = await User.findById(req.user?._id);
    if (profilePhoto) {
      if (user.profilePhoto) {
        await cloudinary.uploader.destroy(
          user.profilePhoto.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await uploadOnCloudinary(profilePhoto);
      profilePhoto = uploadedResponse.url;
    }

    const newUser = await User.findByIdAndUpdate(
      user,
      {
        $set: {
          fullname,
          email,
          phoneNumber,
          profilePhoto,
        },
      },
      { new: true }
    ).select("-password ");
    console.log(user);
    return res
      .status(200)
      .json(new ApiResponse(200, newUser, "User Profile updated successfully"));
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
