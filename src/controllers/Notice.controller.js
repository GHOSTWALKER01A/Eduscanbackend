import { Notice } from "../models/Notice.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";





const getAllNotice = asyncHandler(async(req, res)=>{
 try {
         const query = {}
     if (req.query.date) {
         query.date = {
             $gte: new Date(req.query.date)
         }
     }
    const notice = await Notice.find(query).sort({date: 1})

    if (!notice) {
    throw new ApiError(400, "notice not found")
}

return res.status(201).json(
    new ApiResponse(
        201,
        {notice},
        "Notice found Successfully"
    )
)

 } catch (error) {
   throw new ApiError(500, error?.message || "Server error in recieving notice")     
 }
})

const getIndividualNotices = asyncHandler(async(req, res)=>{
  try {
    
 const notice = await Notice.findById(req.params.id)

return res.status(201).json(
    new ApiResponse(
        201,
        {notice},
        'Notice by id successfully recieved'
    )
) 


  } catch (error) {
    throw new ApiError(500, error?.message || "server error in displaying notice by id")
  }
})


const uploadNotice = asyncHandler(async(req, res)=>{
 const { title, description,file, uploadedBy } = req.body

    try {
    const notice = new Notice({
        title,
        description,
        file,
        uploadedBy:req.user._id
    })
    await notice.save()

    return res.status(201).json(
        new ApiResponse(
            201,
            {notice},
            "Notice created Successfully"
        )
    )
        
    } catch (error) {
    throw new ApiError( 500, error?.message || "Server in uploading notice")
    }
})


const updateNotice = asyncHandler(async(req, res)=>{

    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
  throw new ApiError(401, 'access denied only admin ')
     }

    try {
        const notice = await Notice.findByIdAndUpdate(
            req.params.id,
             {$set: req.body},
            {new: true, runValidators: true }
        )

    return res.status(202).json(
        new ApiResponse(
            202,
            {notice},
            "Notice get Updated successfully"
        )
    )



    } catch (error) {
        throw new ApiError(500, error?.message || "Server error in updating thr notice")
    }
})


const deleteNotice = asyncHandler(async(req, res)=>{

    try {
   

 if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
  throw new ApiError(401, 'access denied only admin ')
     }

    const notice = await Notice.findByIdAndDelete(
        req.params.id ,
        {
             new: true,
             runValidators: true
         }
    )

    

    return res.status(201).json(
        new ApiResponse(
            201,
            {notice},
            "Deleted notice successfully"
        )
    )
        
} catch (error) {
   throw new ApiError(500, error?.message || "Server error in deleting the noitice")      
  }
})



export{
    getAllNotice,
    getIndividualNotices,
    uploadNotice,
    updateNotice,
    deleteNotice
}