import { Event } from "../models/Event.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";



const AllEvents = asyncHandler(async(req , res)=>{
   try {
     const query = {}
     if (req.query.date) {
         query.date = {
             $gte: new Date(req.query.date)
         }
     }
     const events = await  Event.find(query).sort({date : 1})
     
     if (!events) {
         throw new ApiError(400, "Event no found")
     }
 
     return res.status(200).json(
      new ApiResponse(
         200,
         {events},
         "Event found"
      )
     )
   } catch (error) {
    throw new ApiError(500, 'EVENT NOT FOUND SERVER ERROR')
   }
})


const IndividualEvent = asyncHandler(async(req , res)=>{
    
   try {
     const Events = await Event.findById(req.params.id)
 
     if (!Events) {
        throw new ApiError(401, "Individual event not found")        
     }
     return res.status(200).json(
         new ApiResponse(
             200,
             {Events}
         )
     )
   } catch (error) {
    throw new ApiError(500, "Individual event not found due to server error")

   }


})

const NewEvent = asyncHandler(async(req, res)=>{
    const { title, description, date, time, location, image_url, video_url } = req.body;
   try {
     if (req.user.role !== 'admin' && req.user.role !== 'teacher' ) {
         throw new ApiError(401, 'access denied only admin and teacher can add new event')
     }

     const image_url_path = await req.files?.image_url[0]?.path

     if (!image_url_path) {
        throw new ApiError(400, "Image path not found")
     }

     const uploadImageOnCloudinary = await uploadOnCloudinary(image_url_path)

     if (!uploadImageOnCloudinary) {
        throw new ApiError(400, "image not uploaded to cloudinary")
     }

 
     const events = new Event({
        title,
        description,
        date,
        time,
        location,
        image_url,
        video_url,
        uploaded_by:req.user._id
     })
     await events.save()
 
     return res.status(200).json(
         new ApiResponse(
             200,
             {events},
             "New Event created"
 
         )
     )
     
   } catch (error) {
    throw new ApiError(501, "Event not created try again later")
   }


})

const UpdateEvent = asyncHandler(async(req, res)=>{
try {
    
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
  throw new ApiError(401, 'access denied only admin and teacher ')
     }
    
     const Events = await Event.findByIdAndUpdate(
        req.params.id,
        {$set: req.body},
        {new: true, runValidators: true}
    )
    
    if (!Events) {
        throw new ApiError(401, "Event not found ")
    }
    
    return res.status(200).json(
        200,
        {Events},
        "Event updated"
    )
    
} catch (error) {
    throw new ApiError(500 , "Event not updated due to server error")
}

})


const DeleteEvent = asyncHandler(async(req, res)=>{
    try {
if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
  throw new ApiError(401, 'access denied only admin ')
     }
    
        const Events = await Event.findByIdAndDelete(req.params.id)
    
        if (!Events) {
            throw new ApiError(401, "Event not found which has to delete ")
        }
    
        return res.status(200).json(
            new ApiResponse(
                200,
                {Events},
                "Event Deleted"
            )
        )
    } catch (error) {
        throw new ApiError(502, "Event not deleted due to server error")


    }
})







export {
    AllEvents,
    IndividualEvent,
    NewEvent,
    UpdateEvent,
   DeleteEvent
}