import express from "express";
import dotenv from "dotenv";
import { app } from "./app.js";

import dbConnect from "./db/dbConnect.js";

dotenv.config({ path: "./.env" });

dbConnect()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port : ${process.env.PORT}`);
    });

    app.on("error", (err) => {
      console.log("ERR", err); //When our app is not able to talk to the server although it is created.
      throw err;
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!", err);
  });
