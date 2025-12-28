import { Doubt } from "../models/Doubt.model.js";
import { Attendance } from "../models/Attendence.model.js";
import { Schedule } from "../models/Schedule.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Class } from "../models/Class.model.js";
import { User } from "../models/User.model.js";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';



const getTeacherDoubts = asyncHandler(async(req, res)=>{
    try {
        const doubts = await Doubt.find({
            teacher_id: req.user._id
        })

    return res.status(201).json(
        new ApiResponse(
            201,
            {doubts},
            "Doubts recieved successfully"
        )
    )
    } catch (error) {
     throw new ApiError(501, error?.message || "Server error in getting doubt")
    }
})

const respondDoubt = asyncHandler(async(req, res)=>{
    const { id } = req.params
    const { response, response_type, response_media_url} = req.body

try {
    const doubt = await Doubt.findById(id)
    if (!doubt || doubt.teacher_id.toString() !== req.user._id ) {
      throw new ApiError(400, "Access denied for response")
    }
    doubt.response = response;
    doubt.response_type = response_type;
    doubt.response_media_url = response_media_url;
    doubt.status = 'resolved';
    await doubt.save()

    return res.status(201).json(
        new ApiResponse(
            201,
            {doubt},
            "Doubt send to student successfully"
        )
    )

} catch (error) {
    throw new ApiError(501, error?.message || "Server error in sending responce of doubt")
}

})

const getTeacherSchedule = asyncHandler(async(req, res)=>{
 try {
        
    const schedule = await Schedule.find({ teacher_id: req.user._id})
    
    return res.status(201).json(
        new ApiResponse(
            201,
            {schedule},
            "Schedule to teacher got Successfully"
        )
    )
} catch (error) {
       throw new ApiError( 501, error?.message || "Server issue in getting Schedule ") 
    }
})

const getClassAttendance = asyncHandler(async(req, res)=>{
    const { class_id, date } = req.params

    try {
        const attendance = await Attendance.findOne({
            class_id,
            date: new Date(date) 
        })

    return res.status(202).json(
        new ApiResponse(
            202,
            {attendance},
            "Get the attendance successfully"
        )
    )
    } catch (error) {
        throw new ApiError(502, error?.message || "Serveer error in getting attendance")
    }
})

const getStudentsBySemesterBranch = asyncHandler(async(req, res)=>{
    try {
        const students = await User.aggregate([
            {
                $match: { role: 'student'}
            },
            {
                $group: {
                    _id: { semester: '$semester', branch: '$branch'},
                    students: { $push: { id:'$_id', name: '$name', registrationno: '$registrationno'}}
                }
            },
            { $sort: {
                '_id.semester': 1, '_id.branch': 1
            }
        }
        ])
     return res.status(201).json(
        new ApiResponse(
            201,
            {students},
            "Studnt got by all its info "
        )
     )
    } catch (error) {
        throw new ApiError( 500, error?.message || "servr error in fetching student info")
    }
})


const getProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    .select('-password -refreshtoken');

    if (!user){
     throw new ApiError(404, 'User not found');
    }

    return res.status(200).json(
        new ApiResponse(
            200,
             user,
     'Profile fetched'
    ));

  } catch (error) {
    console.error('Error fetching profile:', error);
    throw new ApiError(500, 'Failed to fetch profile');
  }
});

const updateProfile = asyncHandler(async(req ,res) =>{
  try {
    const { name, email, phone, profilePhoto } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.fullname = name || user.fullname;
    user.email = email || user.email;
    user.phonenumber = phone || user.phonenumber;
    user.profilephoto = profilePhoto || user.profilephoto;
    await user.save();

    return res.status(200).json(
      new ApiResponse(
      200,
      user,
     'Profile updated'
    ));
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new ApiError(500, 'Failed to update profile');
  }
})

const getClassStudents = asyncHandler(async (req, res) => {
  try {
    const { classId } = req.params;

    const attendances = await Attendance.find({ classId })
    .populate('studentId', 'fullname registrationno');

    const students = attendances.map(a => ({
      regNo: a.studentId.registrationno,
      name: a.studentId.fullname,
      present: a.isValid,
      method: a.method,
    }));
    return res.status(200).json(
      new ApiResponse(
        200, 
      students,
   'Students fetched'
  ));
  } catch (error) {
    console.error('Error fetching students:', error);
    throw new ApiError(500, 'Failed to fetch students');
  }
});


export {
    getTeacherDoubts,
    getClassAttendance,
    getTeacherSchedule,
    respondDoubt,
    getStudentsBySemesterBranch,
    
    getProfile,
    updateProfile,
    getClassStudents
    

    
}