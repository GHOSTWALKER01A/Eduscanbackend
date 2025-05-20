import express from "express"
import dotenv from "dotenv"

import connectDB from "./db/index.js";
import startServer from "./utils/DeepseekAI.utils.js";

const app = express()

dotenv.config({
  path: './env'
})




startServer()

connectDB()
.then(()=>{
  app.listen(process.env.PORT || 5000, ()=>{
    console.log(`** SERVER IS RUNNING ON PORT : ${process.env.PORT}`);
    
  })
})
.catch((err)=>{
  console.log('MONGO DB connection failed',err);
  
})