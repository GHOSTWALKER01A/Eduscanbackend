import { Attendance } from "../models/Attendence.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asynchandler.js"
import { User } from "../models/User.model.js"
import { Class } from "../models/Class.model.js"
import Redis from "ioredis"
import crypto from "crypto-js"
import geolib from "geolib"




const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')



const CONSISTENCY_CHECK_INTERVAL = 3 * 60 * 1000; // 3 minutes
const ATTENDANCE_THRESHOLD = 40 * 60 * 1000; // 40 minutes
const RELAXATION_TIME = 5 * 60 * 1000; // 5 minutes

const geoLocation = asyncHandler(async(req, res)=>{
  const { classId, macAddress} = req.body
  try {
    const classDoc = await Class.findById(classId)

    if (!classDoc) {
      throw new ApiError(404,'Class not found')
    }
  
   let markedCount = 0
   for ( const mac of macAddress ) {  
      const hashedMac = crypto.createHash('sha256').update(mac).digest('hex')
      const student = await User.findOne({
                macHash: hashedMac,
                role: 'student'
        })
     if (!student) {
       continue
     }

     const key = `attendance:${studentId}:${classId}:${new Date().toDateString()}`
     let presenceTime = parseInt( await redis.get(key) || '0') + CONSISTENCY_CHECK_INTERVAL
     await redis.set(key, presenceTime, 'EX', 3600 )
     
     // Check for Thresold

     if (presenceTime >= (ATTENDANCE_THRESHOLD - RELAXATION_TIME)) {
      const existing = await Attendance.findOne({ 
        studentId: student_id,
         classId 
        })


      if (!existing) {
       const attendance = await Attendance.create({
            classId,
            studentId: student._id,
            teacherId: classDoc.teacherId,
            macHash: hashedMac,
            method: 'auto',
            status: 'present', 
       })
       markedCount++

       // For emitting real-time notification
      req.app.get('io').emit('attendanceMarked', {
         studentId: student_id,
          classId,
           status: 'present'
          })
      } 
      await redis.del(key)  // Reset of counter after marking
    }

  }

  return res.status(201).json(
    new ApiResponse(
      201,
      { marked: markedCount},
      "ATTendance Done via MacAddress"
    )
  )
    
  } catch (error) {
    console.error('Geo Location error:', error);
    throw new ApiError(500, error?.message || 'Server error in auto attendance')
    
  }
})



const markAttendanceViaQR = asyncHandler(async (req, res) => {
 
  const { scannedData, classId, qrToken, latitude, longitude } = req.body; // Parsed vCard data from frontend
  const studentId = req.user._id;
 
  try {

    const storedToken = await redis.get(`qr:${classId}`)
    if (storedToken !== qrToken) {
      throw new ApiError(401, 'Invalid or Expiry token')
    }

    
    if (req.user.role !== 'student') {
      throw new ApiError(401, 'Only student are allowed ')
    }

    const teacherLocation = { latitude: cls.teacher_latitude, longitude: cls.teacher_longitude  }
    const distance = geolib.getDistance({ latitude, longitude}, teacherLocation)
    if ( distance > 12) {
      throw new ApiError(401, 'Must be under 12 meter of distance')
    }
    

    // Parse vCard data
    const lines = scannedData.split('\n');

    const parsed = {
        teacherName: '',
       teacherId: '', 
       subject: '', 
       
      };
    lines.forEach(line => {
      if (line.startsWith('FN:')) parsed.teacherName = line.replace('FN:', '').trim();
      if (line.startsWith('UID:')) parsed.teacherId = line.replace('UID:', '').trim();
      if (line.startsWith('SUBJECT:')) parsed.subject = line.replace('SUBJECT:', '').trim();
    });

    // Validate teacher exists and is a teacher
    const teacher = await User.findOne({
      registrationno: parsed.teacherId,
       role: 'teacher' 
      });
    if (!teacher) {
      throw new ApiError(400, 'Invalid teacher QR code. This QR is not from a valid teacher.')
    }

    // Find the class (assume current class or match subject/date; simplify here)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1)
    ;
    const cls = await Class.findOne({ 
      teacherId: teacher._id, 
      subject: parsed.subject, 
      date: {
         $gte: today,
         $lt: tomorrow
         },
      status: {
         $ne: 'cancelled' 
        },
    });
    if (!cls) {
      throw new ApiError(400, 'No active class found for this QR');
    }

    // Check if already marked
    const existing = await Attendance.findOne({
       studentId, 
       classId: cls._id 
      });

    if (existing) {
      throw new ApiError(400, 'Already marked attendance for this class');
    }

    // Mark attendance
    const attendance = await Attendance.create({
      classId: cls._id,
      studentId,
      teacherId: teacher._id,
      student_latitude: latitude,
      student_longitude: longitude,
      method: 'manual',
      status: 'present',
      token: scannedData
    });

    // Update class totalStudents
    cls.totalStudents = await Attendance.countDocuments({ classId: cls._id });
    await cls.save();

    // for real time update
    req.app.get('io').emit('attendanceMarked', {
       studentId: req.user._id,
        classId: cls._id,
         status: 'present' 
        });

    return res.status(200).json(
      new ApiResponse(
        200, 
        { attendance, ...parsed,  class: cls._id },
         'Attendance marked successfully Via Qr'
        ));

  } catch (error) {
    console.error('Error marking attendance via Qr:', error);
    throw new ApiError(400, error.message || 'Failed to scan QR ');
  }
});


const enrollMac = asyncHandler(async(req, res)=>{
  const { macAddress } = req.body
  try {
    const user = await User.findById(req.user._id)

    if (!user || user.role !== 'student') {
      throw new ApiError(401, 'Only students can enroll MAC')
    }

    user.macAddress = macAddress
    await user.save()  // it pre-saves the hash mac 

    return res.status(201).json(
      new ApiResponse(
        '201',
        { macHash: user.macHash },
        'Mac Enrolled Successfull'
      )
    )
  } catch (error) {
    console.error('Enroll MAC error:', error);
    throw new ApiError(500, error?.message || 'Failed to enroll MAC');
  }
})





export {
   geoLocation,
    markAttendanceViaQR,
    enrollMac
}