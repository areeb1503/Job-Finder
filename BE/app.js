import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)
app.use(cookieParser());
app.use(express.static("public"))


// Routes import 
import userRoutes from './route/user.route.js';
import jobRoutes from "./route/job.route.js"



// Route declaration

app.use('/api/v1/users', userRoutes); //localhost:8000/api/v1/users/
app.use('/api/v1/jobs', jobRoutes); 

export {app}