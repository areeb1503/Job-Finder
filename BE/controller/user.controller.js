import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js"
import { ApiResponse } from "../utils/apiResponse.js";

import bcrypt from "bcryptjs";
import { uploadOnCloudinary } from "../utils/uploadThing.js";


export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;

        if (!fullname || !email || !phoneNumber || !password || !role) {
            throw new ApiError(400, "Please fill in all fields");
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { phoneNumber }]
        });
        if (existingUser) {
            throw new ApiError(400, "User already exists");
        }

        const resumeFile = req.files?.resume[0]?.path;  
        const resumeUpload = await uploadOnCloudinary(resumeFile);
       
        // console.log(resumeUpload?.url);
        const profilePhoto = req.files?.profilePhoto[0]?.path;  // Assuming multer has parsed the profile photo
        const profilePhotoUpload = await uploadOnCloudinary(profilePhoto);  // Pass the 'image' tag
        
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user in the database

        const user = await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            resume:resumeUpload?.url || "",   
            profilePhoto: profilePhotoUpload?.url 
        });


        // Fetch the created user without the password
        const createdUser = await User.findById(user._id).select("-password");

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user");
        }

       return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Error in register controller", error.message);
    }
};