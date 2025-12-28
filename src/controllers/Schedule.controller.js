import {Schedule} from "../models/Schedule.model.js"
import {User} from "../models/User.model.js"
import { asyncHandler } from "../utils/asynchandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"




const  getSchedule = asyncHandler(async(req, res)=>{
    try {
        const studentId = req.user._id

        const student = await User.findById(studentId)
        if (!student || student.role !== 'student') {
            throw new ApiError(403, "Only Student can Access this")
        } 

        const { branch = student.branch, semester = student.semester, day = '' } = req.query;
        const query = { branch, semester };

        if (day) {
            query.day = day
        
        }

     const schedules = await Schedule.find(query)
       .populate('teacherId', 'fullname')
       .sort({ time: 1 })
       .select('time startTime endTime day subject type branch semester room date teacherId isRecess');

       const grouped = schedules.reduce((acc, schedule) => {
      if (!acc[schedule.time]) acc[schedule.time] = { time: schedule.time, subjects: [], recess: schedule.isRecess };
      if (!schedule.isRecess) {
        acc[schedule.time].subjects.push({
          day: schedule.day,
          subject: schedule.subject,
          type: schedule.type,
          room: schedule.room,
          date: schedule.date.toISOString().split('T')[0], // YYYY-MM-DD
          teacherName: schedule.teacherId.fullname,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        });
      }
      return acc;
    }, {})

    const scheduleData = Object.values(grouped);
    return res.status(200).json(
        new ApiResponse(
            200,
            scheduleData,
            "Schedule Fetched Successfully "
        )
    )

    } catch (error) {
     console.error('Error fetching schedule:', error);
    throw new ApiError(500, error.message || 'Failed to fetch schedule')
    }
})


const getTeacherSchedule = asyncHandler(async (req, res) => {
  const teacherId = req.user._id;
  if (req.user.role !== 'teacher') throw new ApiError(403, 'Access denied');

  const { day } = req.query;
  const query = { teacherId };
  if (day) query.day = day;

  const schedules = await Schedule.find(query)
    .sort({ time: 1 })
    .select('time day subject type branch semester room date status rescheduledTo rescheduledRoom');

  const grouped = schedules.reduce((acc, s) => {
    if (!acc[s.time]) acc[s.time] = { time: s.time, subjects: [] };
    acc[s.time].subjects.push({
      _id: s._id,
      day: s.day,
      subject: s.subject,
      type: s.type,
      room: s.room,
      date: s.date.toISOString().split('T')[0],
      status: s.status,
      rescheduledTo: s.rescheduledTo,
      rescheduledRoom: s.rescheduledRoom,
    });
    return acc;
  }, {});

  return res.status(200).json(
    new ApiResponse(
        200,
         Object.values(grouped),
         'Schedule fetched'
        ));
});

const rescheduleClass = asyncHandler(async (req, res) => {
  const { classId, newDate, newRoom } = req.body;
  const teacherId = req.user._id;

  const schedule = await Schedule.findOne({ _id: classId, teacherId });
  if (!schedule) throw new ApiError(404, 'Class not found');

  schedule.status = 'rescheduled';
  schedule.rescheduledTo = newDate;
  schedule.rescheduledRoom = newRoom;
  await schedule.save();

  return res.status(200).json(
    new ApiResponse(
        200,
        schedule, 
        'Class rescheduled'
        ));
});

const cancelClass = asyncHandler(async (req, res) => {
  const { classId } = req.body;
  const teacherId = req.user._id;

  const schedule = await Schedule.findOne({ _id: classId, teacherId });
  if (!schedule) throw new ApiError(404, 'Class not found');

  schedule.status = 'cancelled';
  schedule.cancelledAt = new Date();
  await schedule.save();

 return res.status(200).json(
    new ApiResponse(
        200,
       schedule,
     'Class cancelled'
    ));
});


export{
    getSchedule,
    getTeacherSchedule,
    rescheduleClass,
    cancelClass

}