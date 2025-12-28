
import dotenv from "dotenv"
import {app} from './app.js'
import connectDB from "./db/index.js";
import { Server } from "socket.io";




dotenv.config({
  path: './.env'
})






connectDB()
.then(()=>{
  app.listen(process.env.PORT || 5000, ()=>{
    console.log(`** SERVER IS RUNNING ON PORT : ${process.env.PORT}`);
    
  })

  Server.listen(process.env.PORT || 5000, ()=>{
    console.log(`** SERVER IS RUNNING ON PORT : ${process.env.PORT}`)
  }
  )
})
.catch((err)=>{
  console.log('MONGO DB connection failed',err);
  
})