import { User } from "../models/User.model.js";
import { Session } from "../models/Session.model.js";


import { Attendance } from "../models/Attendence.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";




const loggedinTeacher = asyncHandler(async(req, res)=>{
try {
    const loggedTeachers = await Session.find().populate({
       path: 'user_id',
       match: { role: 'Teacher'},
       select: 'name email',
    })

    const teacher = loggedTeachers.filter(session => session.user_id)

 return  res.status(201).json(
    new ApiResponse(
        200,
        {teacher},
        "got Teacher detail Successfully "
    )
 )
} catch (error) {
    throw new ApiError(501, error?.message || "Tacher not logged in")
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

const getStudentAttendance = asyncHandler(async(req, res)=>{
    const { student_id } = req.params
    try {
     const attendance = await Attendance.find({
        'students.student_id': student_id
     })

     return res.status(201).json(
        new ApiResponse(
            200,
            {attendance},
            "Attendance got  Successfully"
        )
     )
    } catch (error) {
        
    }
})

export{
    loggedinTeacher,
    getStudentAttendance,
    getStudentsBySemesterBranch
}