import {Schedule} from "../models/Schedule.model.js"
import { Class } from "../models/Class.model.js"
import { asyncHandler } from "../utils/asynchandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"





const teacherupdate = asyncHandler(async(req ,res)=>{

    try {
        const schedule = await Schedule.findOne().populate({
            path: 'class_id',
            populate: {
                path:'teacher_id', 
                model: 'User'
            }
        })

        return res.status(200).json(
            new ApiResponse(
                200,
                {schedule},
                "Schedule uploaded"
            )
        )
    } catch (error) {
        throw new ApiError(400, "Schedule not fetching")
    }
})




const timetable = asyncHandler(async(req ,res)=>{
    const { day } = req.params
try {
    
        const schedule = await Schedule.find({days_of_week : day})
                         .populate({
                            path: "class_id",
                            populate:{
                                path: 'teacher_id',
                                model : "User"
                            }
                        })
           return res.status(200).json(
            new ApiResponse(
                200,
                {schedule},
                "Time table displayed"
            )
           )
} catch (error) {
    throw new ApiError(400, "Problem on Displaying table")
}
})



const Displaytimetable = asyncHandler(async(req , res)=>{
   try {
      
     const {class_id,days_of_week,starttime,endtime,room} = req.body
 
     if (!class_id || !days_of_week || !starttime || !endtime || !room ) {
         throw new ApiError(400, "all fields required")
     }
     const classdetail = await Class.findById(class_id)
 
     if (!classdetail) {
         throw new ApiError(400, "Class not found")
     }
 
     if (req.user.role !== "Admin" && classdetail.teacher_id.toString() !== req.user._id) {
          throw new ApiError(400, "deatils not got just admin can update")
     }
         
     const schedule = new Schedule({class_id,days_of_week,starttime,endtime,room})
     await schedule.save()
 
     return res.status(200).json(
         new ApiResponse(
             200,
             {Displaytimetable},
             "time table displayed"
         )
     )
   } catch (error) {
    throw new ApiError(400, error?.message || "NOt displayed the table")
   }
})


const updateschedule = asyncHandler(async(req , res)=>{

   try {
     const {id} = req.params
     const {class_id,days_of_week,starttime,endtime,room} = req.body
 
 
    const schedule = Schedule.findById(id).populate("class_id");
 
    if (!schedule) {
     throw new ApiError(400, "Class not updated")
    }
 
    if (req.user.role !== "Admin" && schedule.class_id.teacher_id.toString() !== req.user._id) {
      throw new ApiError(400, "access denied only admin can update")
    }
    schedule.class_id = class_id || schedule.class_id;
    schedule.days_of_week = days_of_week || schedule.days_of_week;
    schedule.starttime = starttime || schedule.starttime;
    schedule.endtime = endtime || schedule.endtime;
    schedule.room = room || schedule.room;
    await schedule.save()
 
    return res.status(200).json(
     new ApiResponse(
         200,
         {schedule},
         "Scheduled update"
     )
    )
    
   } catch (error) {
    throw new ApiError(500, "server issue for update")
   }

})

const deleteschedule = asyncHandler(async(req , res)=>{
     try {
        const { id } = req.params
   
        const schedule = await Schedule.findById(id).populate('class_id')
   
        if (!schedule) {
           throw new ApiError(401, "Schedule not found")
        }
        if (req.user.role !== 'Admin' && schedule.class_id.teacher_id.toString() !== req.user._id) {
           throw new ApiError(404, "Access denied for user")
        }
   
        const Deleteschedule = await schedule.deleteOne()
   
        return res.status(200).json(
           new ApiResponse(
               200,
               {Deleteschedule},
               "Schedule deleted"
           )
        )
     } catch (error) {
        throw new ApiError(501, 'Not deleted schedule due to server error')
     }

    })    

export {
   teacherupdate,
   timetable,
   Displaytimetable,
   updateschedule,
   deleteschedule
}