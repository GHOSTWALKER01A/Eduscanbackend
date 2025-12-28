import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';
import http from 'http'
import { initSocket } from "./utils/Socket.js";



const app = express() 

const server = http.createServer(app)
const io = initSocket(server)

app.set('io',io)
 
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended: true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())



// Routes

import userRouter from "./routes/auth.routes.js"
import teacherRouter from "./routes/teacher.routes.js"
import attedanceStudentRouter from "./routes/attendanceStudent.routes.js"
import studentRouter from "./routes/student.routes.js"
import gradeRouter from "./routes/grade.routes.js"
import assignmentRouter from "./routes/assignment.routes.js"
import classTeacherRouter from "./routes/teacherClasses.routes.js"
import resourceRouter from "./routes/Resource.routes.js"
import scheduleRouter from './routes/schedule.routes.js';
import scheduleTeacherRouter from './routes/teacherschedule.routes.js';



// Declaration
app.use("/api/v1/users",userRouter)

app.use('/api/v1/teacher', teacherRouter)

app.use('/api/v1/student', studentRouter)

app.use('/api/v1/classes', classTeacherRouter)

app.use('/api/v1/assignments', assignmentRouter);

app.use('/api/v1/grades', gradeRouter);

app.use('/api/v1/attendance', attedanceStudentRouter);

app.use('/api/v1/resources', resourceRouter)

app.use('/api/v1/schedule', scheduleRouter)

app.use('/api/v1/schedule/teacher', scheduleTeacherRouter)





export {app}
