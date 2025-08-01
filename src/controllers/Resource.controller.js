import { Resource } from "../models/Resource.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";





const GetAllresource = asyncHandler(async(req, res)=>{
try {
    
        const resource = await Resource.find().populate('uploadedby',"name email")
    
        return res.status(200).json(
            new ApiResponse(
                200,
                {resource},
                "all resources fetched"
            )
        )
} catch (error) {
    console.log('Fetching the resource: ',error?.message);
    
    throw new ApiError(500, error?.message || "Error While fetching all resources")
}
})

const Createresource = asyncHandler(async(req, res)=>{

   try {
     if (!['Teacher','Admin'].includes(req.user.role)) {
         throw new ApiError(400, "only Teacher and admin can upload resource")
     }
 
     const resource = new Resource({
         title: req.body.title,
         description: req.body.description,
         type: req.body.type,
         fileUrl: req.body.fileUrl,
         uploadedBy: req.user._id
     })
     const SavedResource = await resource.save()
 
     return res.status(200).json(
         new ApiResponse(
             200, 
             {SavedResource},
             "new file resource created"
         )
     )
   } catch (error) {
    console.log("new REsource created not : " , error.message);
    throw new ApiError(500,error?.message || "Error while creating new resource")
    
   }
})

const Updateresource = asyncHandler(async(req, res)=>{
try {
    
        const resource = await Resource.findById(req.params.id);
    
        if (!resource) {
            throw new ApiError(404,"Resource not found")
        }
    
        if (resource.uploadedby.toString() !== req.user._id && req.user.role !== "Admin") {
            
            throw new ApiError(403, "Unauthorized to update this resource")
    
        }
    
        const UpdateResource = await Resource.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true}
    
        )
        return res.status(200).json(
            new ApiResponse(
                200,
                {UpdateResource},
                "Rsource is updated"
            )
        )
} catch (error) {
    console.log("Error in Updateding resource: ", error?.message);
    throw new ApiError(500, error?.message || "Error in updating resource")
}
})


const Deleteresource = asyncHandler(async(req, res)=>{
    try {
    
        const resource = await Resource.findById(req.params.id);
    
        if (!resource) {
            throw new ApiError(404,"Resource not found")
        }
    
        if (resource.uploadedby.toString() !== req.user._id && req.user.role !== "Admin") {
            
            throw new ApiError(403, "Unauthorized to delete this resource")
    
        }
    
        const DeleteResource = await Resource.findByIdAndDelete(req.params.id,
             { new: true, runValidators: true}
         )

        if (!DeleteResource) {
            throw new ApiError(402, "not deleted")
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                {DeleteResource},
                "Rsource is deleted"
            )
        )
} catch (error) {
    console.log("Error in Deleting resource: ", error?.message);
    throw new ApiError(500, error?.message || "Error in updating resource")
}
})



export {
    GetAllresource,
    Createresource,
    Updateresource,
    Deleteresource
}