import { Resource } from "../models/Resource.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

import { v2 as cloudinaryV2 } from "cloudinary";




const getResource = asyncHandler(async(req, res)=>{
    try {
        const { search = '', page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
      ];
    }

    if (type && ['Academic material', 'Previous year paper'].includes(type.toLowerCase())) {
      query.type = type; 
    } else if (type) {
      throw new ApiError(400, 'Invalid type. Use "Academic material" or "Previous year paper"');
    }


    const resources = await Resource.find(query)
    .populate('uploadedBy', 'fullname registrationno')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))

    const total = await Resource.countDocuments(query)

    return res.status(200).json(
        new ApiResponse(
            200,
            { resources,
              pagination:{ 
                current: page,
                 pages: Math.ceil(total / limit),
                  total
                 } 
            },
          "Resource Fetched"
            
        )
    )
        
    } catch (error) {
        throw new ApiError(500,error?.message || 'Server error in getting Resource')
    }
})

 const getResourceById = asyncHandler(async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('uploadedBy', 'fullname registrationno');
    
    if (!resource){
     throw new ApiError(404, 'Resource not found');
    }

   return res.status(200).json(
    new ApiResponse(
        200,
         resource,
        'Resource fetched'
        )
    );
  } catch (error) {
    console.error('Error fetching resource:', error);
    throw new ApiError(500, error.message || 'Failed to fetch resource');
  }
});



const createResource = asyncHandler(async(req, res)=>{

   try {
     if (!['Teacher','Admin'].includes(req.user.role)) {
         throw new ApiError(400, "only Teacher and admin can upload resource")
     }

    const { title, description, fileUrl, type } = req.body;
    if (!title || !type){
         throw new ApiError(400, 'Title and type are required');
    }

  const resourceMediaLocalpath = req.files?.fileUrl?.[0]?.path;

  if (!resourceMediaLocalpath) {
    throw new ApiError(400, "ResourceMedia required ");
  }

  const resorceMedia = await uploadOnCloudinary(resourceMediaLocalpath);



     const resource = new Resource({
         title,
         description,
         type,
         fileUrl: resorceMedia.url,
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

const updateResource = asyncHandler(async(req, res)=>{
try {
    
        const resource = await Resource.findById(req.params.id);
    
        if (!resource) {
            throw new ApiError(404,"Resource not found")
        }
    
        if (resource.uploadedby.toString() !== req.user._id && req.user.role !== "Admin") {
            
            throw new ApiError(403, "Unauthorized to update this resource")
    
        }

        const updateData = req.body
        if (req.file) {
            // Delete old file from cloudinary 
            if (resource.fileUrl) {
                const publicId = resource.fileUrl.split('/').pop().split('.')[0]
                 await cloudinaryV2.uploader.destroy(publicId)

            }
            updateData.fileUrl = await uploadOnCloudinary(req.file)
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


const deleteResource = asyncHandler(async(req, res)=>{
    try {
    
        const resource = await Resource.findById(req.params.id);
    
        if (!resource) {
            throw new ApiError(404,"Resource not found")
        }
    
        if (resource.uploadedby.toString() !== req.user._id && req.user.role !== "Admin") {
            
            throw new ApiError(403, "Unauthorized to delete this resource")
    
        }

        if (resource.fileUrl) {
          const publicId = resource.fileUrl.split('/').pop().split('.')[0];
          await cloudinaryV2.uploader.destroy(publicId);
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
                {},
                "Rsource is deleted"
            )
        )
} catch (error) {
    console.log("Error in Deleting resource: ", error?.message);
    throw new ApiError(500, error?.message || "Error in updating resource")
}
})



export {
    getResource,
    getResourceById,
    createResource,
    updateResource,
    deleteResource
}