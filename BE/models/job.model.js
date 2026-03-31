import mongoose, { Schema } from "mongoose";

const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    company: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },

    job_link: {
      type: String,
      required: true,
    },
    contract_time:{
      type: String,
    },
    contract_type:{
      type: String,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    skillKeywords: [
      
       {
        type:String,
       }
    ],
  },
  { timestamps: true }
);
export const Job = mongoose.model("Job", jobSchema);
