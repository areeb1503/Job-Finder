import mongoose,{Schema} from "mongoose";

const userSchema= new Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:['student','recruiter'],
        required:true
    },
    
        bio:{type:String},
        resume:{type:String,default:""}, // URL to resume file
        resumeOriginalName:{type:String},
        company:{type:mongoose.Schema.Types.ObjectId, ref:'Company'}, 
        profilePhoto:{
            type:String,
            default:""
        },
    
    likedJobs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            default: [],
        },
    ],
    
},{timestamps:true})
export const User=mongoose.model('User',userSchema)