import mongoose,{Schema} from "mongoose";

const jobSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    company:{
        type:Schema.Types.ObjectId,
        ref:'Company',
        required:true
    },
    description:{
        type:String,
        required:true
    },
    salary:{
        type:Number,
        required:true
    },
    requiredSkills:[{
        type:String,
        required:true
    }],
    experienceLevel:{
        type:Number,
        required:true,
    },
    openings: {
        type: Number,
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
        }
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
},{timestamps:true})
export const Job=mongoose.Schema('Job',jobSchema)