import mongoose from "mongoose";
const feedbackSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true
    },
    feedbackText: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
   
  },{timestamps:true});
  
  export const Feedback = mongoose.model('Feedback', feedbackSchema);