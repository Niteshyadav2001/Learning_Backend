//2nd approach and a professional one
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from './app.js';

dotenv.config({
    path: './.env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at port ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed ",err);
})










// import mongoose from "mongoose";
// import express from "express";
// import { DB_NAME } from "./constants";

// const app = express()



//1st approach
//sara connection ka code yahi likhenege

// ( async () =>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

//         app.on("error", (error)=>{
//             console.log("ERROR", error);
//             throw error
//         })

//         app.listen(process.env.PORT, ()=>{
//             console.log(`App is listening on port ${process.env.PORT}`);
//         })
        
//     } catch (error) {
//         console.error("ERROR", error);
//         throw error
//     }
// })