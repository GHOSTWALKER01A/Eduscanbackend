import { Attendance } from "../models/Attendence.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asynchandler.js"



const Getattendence = asyncHandler(async(req  , res)=>{
  try {
      const classes = {}
      if (req.query.student) filters.student_id = req.query.student_id   
      if (req.query.class) filters.class_id = req.query.class_id   
      if (req.query.date) filters.date =new Date( req.query.date)
  
      const records = await Attendance.find(classes)
      .populate('student', 'email')
      .populate('class', 'name')
  
      return res.status(200).json(
          new ApiResponse(
              200,
              {records},
              "Class found for Day"
          )
      )
  } catch (error) {
    throw new ApiError(500, error?.message || "class not found for attendence ")
  }

    
})


const Newattendence = asyncHandler(async(req , res)=>{
    
 try {
  const { student_id, class_id, date, status} = req.body
 
  if (!["Teacher","Admin"].includes(req.user.role)) {
    throw new ApiError(403, "Only teacher and Admin can Access this")
  }
  
  const newAttendance = new Attendance({
   student_id,
   class_id,
   date,
   status
  })
 
  const savedRecord = await newAttendance.save()
 
  return res.status(200).json(
   new ApiResponse(
     200,
     {savedRecord},
     "Attaindance created"
   )
  )
 } catch (error) {
  throw new ApiError(400, error?.message || "Attendence not created")
 }

})

export {
    Getattendence,
    Newattendence
}