import { Leave } from "../models/Leave.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";


const Createleave =asyncHandler(async(req, res)=>{
  try {
      const leaveData = {
          user: req.user._id,
          ...req.body
      }
  
      const leave = new Leave(leaveData)
      await leave.save()
      return res.status(200).json(
        new ApiResponse(
            200,
            {leave},
            "Leave application created Successfully"
        )
      )
  } catch (error) {
    console.log("not created : ",error.message);
    
    throw new ApiError(500, error?.message || "New Leave application not created")
  }
});

const Getleave = asyncHandler(async(req, res)=>{

  try {
      const leaves = await Leave.findOne({user:req.user._id}).sort({createdAt: -1})
       
      return res.status(200).json(
          new ApiResponse(
              200,
              {leaves},
              "Leave application fetched"
          )
      )
  } catch (error) {
    throw new ApiError(500, error?.message || "Failed to fetch Leave application")
}
})

const Updateleave = asyncHandler(async(req, res)=>{

   try {
     const leave = await Leave.findById(req.param.id)
 
     if (!leave) {
         throw new ApiError(400, "Leave application not found")
     }
     if (leave.user.toString() !== req.user._id && req.user.role !== "Admin") {
         throw new ApiError(403, "Not Authorised to update this leave application")
     }
     
     const updateleave = await Leave.findByIdAndUpdate(req.params.id, req.body,
         {
             new: true,
             runValidators: true
         }
         
     )
     return res.status(202).json(
        new ApiResponse(
            200,
            {updateleave},
            "Leave Application updated"
        )
     )
   } catch (error) {
    throw new ApiError(500, error?.message || "Leave application not Updated")
   }
    
})



const Deleteleave = asyncHandler(async(req, res)=>{

   try {
     const leave = await Leave.findById(req.param.id)
 
     if (!leave) {
         throw new ApiError(400, "Leave application not found")
     }
     if (leave.user.toString() !== req.user._id && req.user.role !== "Admin") {
         throw new ApiError(403, "Not Authorised to Delete this leave application")
     }
     
     const deleteleave = await Leave.findByIdAndDelete(req.params.id, req.body,
         {
             new: true,
             runValidators: true
         }
         
     )
     return res.status(202).json(
        new ApiResponse(
            200,
            {deleteleave},
            "Leave Application Deleted"
        )
     )
   } catch (error) {
    throw new ApiError(500, error?.message || "Leave application not Deleted")
   }
    
})




export {

}