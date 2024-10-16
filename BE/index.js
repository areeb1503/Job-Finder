import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import dbConnect from "./db/dbConnect.js";

dotenv.config();

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)
app.use(cookieParser());


app.listen(process.env.PORT||8000,()=>{
    console.log(`Server is running on port ${process.env.PORT || 8000}`);
    dbConnect(); // Connect to MongoDB database
})