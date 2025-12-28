import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { Grade } from "../models/Grade.model.js";


const getGradesBySemester = asyncHandler(async (req, res) => {
  try {
    const { semester } = req.params;

    const grades = await Grade.find({
         studentId: req.user._id,
         semester: parseInt(semester)
        });

    if (grades.length === 0) {
        throw new ApiError(404, 'No grades found for this semester')
    }

   return res.status(200).json(
    new ApiResponse(
        200, 
        grades,
     'Grades fetched'
    ));
  } catch (error) {
    console.error('Error fetching grades:', error);
    throw new ApiError(500, 'Failed to fetch grades');
  }
});

export{
    getGradesBySemester
}