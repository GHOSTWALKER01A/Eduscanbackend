import { Event } from "../models/Event.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";



const AllEvents = asyncHandler(async(req , res)=>{
   try {
     const query = {}
     if (req.query.date) {
         query.date = {
             $gte: new Date(req.query.date)
         }
     }
     const events = await  Event.findOne(query).sort({date : 1})
     
     if (!events) {
         throw new ApiError(400, "Event no found")
     }
 
     return res.status(200).json(
         200,
         {events},
         "Event found"
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

   try {
     if (req.user.role !== 'Admin') {
         throw new ApiError(401, 'access denied only admin can add new event')
     }
 
     const Events = new Event(req.body)
     await Events.save()
 
     return res.status(200).json(
         new ApiResponse(
             200,
             {Events},
             "New Event created"
 
         )
     )
     
   } catch (error) {
    throw new ApiError(501, "Event not created try again later")
   }


})

const UpdateEvent = asyncHandler(async(req, res)=>{
try {
    
  if (req.user.role !== 'Admin') {
  throw new ApiError(401, 'access denied only admin ')
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
         if (req.user.role !== 'Admin') {
             throw new ApiError(401, 'access denied only admin ')
            }
    
        const Events = await Event.findByIdAndDelete(req.params.id)
    
        if (!Events) {
            throw new ApiError(401, "Event not found which has to delete ")
        }
    
        return res.status(200).json(
            new ApiResponse(
                200,
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