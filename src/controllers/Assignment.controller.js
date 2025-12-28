import { Assignment } from "../models/Assignment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";





const getAssignments = asyncHandler(async(req, res)=>{
   try {

    const assignments = await Assignment.find({
         studentId: req.user._id 
        }).
        sort({ createdAt: -1 });

   return res.status(200).json(
    new ApiResponse(
        200,
        assignments, 
    'Assignments fetched'
 ));
  
    
   } catch (error) {
    console.error('Error fetching assignments:', error)
    throw new ApiError(500, error?.message || 'Server Error in fetching resource')
   }
})


const createAssignment = asyncHandler(async (req, res) => {
  try {
    const { subject, description, file, fileType } = req.body;

    const assignment = await Assignment.create({
      studentId: req.user._id,
      subject,
      description,
      file,
      fileType,
    });
   return res.status(201).json(
    new ApiResponse(
        201,
     assignment,
 'Assignment created'
 ));

  } catch (error) {
    console.error('Error creating assignment:', error);
    throw new ApiError(500, 'Failed to create assignment');
  }
});

const updateAssignment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, description, file, fileType } = req.body;

    const assignment = await Assignment.findOneAndUpdate(
      { _id: id, studentId: req.user._id },
      { subject, description, file, fileType },
      { new: true }
    );

    if (!assignment){
         throw new ApiError(404, 'Assignment not found')
        }

   return res.status(200).json(
    new ApiResponse(
        200,
     assignment,
 'Assignment updated'
 ));

  } catch (error) {
    console.error('Error updating assignment:', error);
    throw new ApiError(500, 'Failed to update assignment');
  }
});

const deleteAssignment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findOneAndDelete({
         _id: id,
          studentId: req.user._id 
        });

    if (!assignment) {
        throw new ApiError(404, 'Assignment not found')
    }

   return res.status(200).json(
    new ApiResponse(
        200,
         {},
     'Assignment deleted'
    ));

  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw new ApiError(500, 'Failed to delete assignment');
  }
});






export {
    getAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment

}





