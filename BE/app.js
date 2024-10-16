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


// Routes import 


// Route declaration


export {app}