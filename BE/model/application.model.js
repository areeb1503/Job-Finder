import mongoose,{Schema} from "mongoose";

const applicationSchema=new Schema({
    applicant:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    job:{
        type:Schema.Types.ObjectId,
        ref:"Job"
    },
    status:{
        type:String,
        enum:["pending","approved","rejected"],
        default:"pending"
    },


},{timestamps:true})
export const Application=mongoose.model('Application',applicationSchema)