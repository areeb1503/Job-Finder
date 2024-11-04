import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const postJob=async(req,res)=>{
    try {
        const {title,location,company,description,job_link}=req.body;
        if(!title||!location||!company||!description||!job_link){
            throw new ApiError(400,"Please fill in all fields");
        }
        const userId = req.user._id;
        const existingJob=await Job.findOne({job_link})
        if(existingJob){
            throw new ApiError(400,"Job already exists");
        }
        const job=await Job.create({
            title,
            location,
            company,
            description,
            job_link,
            created_by:userId
        })
        return res
        .status(200)
        .json(new ApiResponse(200,job,"New Job created successfully."));
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Error in postJob controller";
        return res.status(statusCode).json({ success: false, statusCode, message });
    }

}
export const likeUnlikeJobs=async(req,res)=>{
    try {
        const userId = req.user._id;
        const { id: jobId } = req.params;
        
        
        const job=await Job.findById(jobId)
        if(!job){
            throw new ApiError(404,"Job not found");
        }
        const isLiked = job.likes.includes(userId);

        // unlike
        if(isLiked){
            await Job.updateOne({_id:jobId},{$pull:{likes:userId}});
            await User.updateOne({_id:userId},{$pull:{likedJobs:jobId}})
            return res.status(200).json(new ApiResponse(200, "Post unliked successfully"));
        }
        // like
        else{
            await Job.updateOne({_id:jobId},{$push:{likes:userId}});
            await User.updateOne({_id:userId},{$push:{likedJobs:jobId}});
            return res.status(200).json(new ApiResponse(200, "Post liked successfully"));
        }

        
    } catch (error) {
        // const statusCode = error.statusCode || 500;
        // const message = error.message || "Error in postJob controller";
        // return res.status(statusCode).json({ success: false, statusCode, message });
        throw new ApiError(500,"Error in like post controller")
        
    }

}