

import { Attendance } from "../models/Attendence.model.js";

import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Class } from "../models/Class.model.js";
import { User } from "../models/User.model.js";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Redis from "ioredis";




const parseTimeToMinutes = (timeStr)=>{
 try {
    const [startTime] = timeStr.split(' - ');
    const timeMatch = startTime.match(/(\d+):(\d+)\s*(AM|PM)/);
    if (!timeMatch) throw new Error('Invalid time format');
    const [, hours, minutes, period] = timeMatch;
    let totalHours = parseInt(hours);
    if (period === 'PM' && totalHours !== 12) totalHours += 12;
    if (period === 'AM' && totalHours === 12) totalHours = 0;
    return totalHours * 60 + parseInt(minutes);
  } catch (error) {
    throw new ApiError(400, 'Invalid time format');
  }
}

const isWithin20MinBeforeEnd = (classDate, classTime, duration = 45) => {
  try {
    const now = new Date();
    const classStart = new Date(classDate);
    const startMinutes = parseTimeToMinutes(classTime);
    classStart.setHours(0, 0, 0, 0);
    classStart.setMinutes(startMinutes);

    const classEnd = new Date(classStart.getTime() + duration * 60 * 1000);
    const twentyMinBeforeEnd = new Date(classEnd.getTime() - 20 * 60 * 1000);

    return now >= twentyMinBeforeEnd && now <= classEnd;
  } catch (error) {
    throw new ApiError(400, error.message || 'Invalid date/time');
  }
};

const generateQRToken = (classId, teacherId) => {
  const payload = {
    classId,
    teacherId,
    timestamp: Date.now(),
    iat: Math.floor(Date.now() / 1000),
  };
  return jwt.sign(payload, process.env.QR_ACCESS_TOKEN, 
    { 
      expiresIn: '15s'
  });
};

const startQrSession = asyncHandler(async(req, res)=>{
   const { classId } = req.params;
  const teacherId = req.user._id;
  
  try {
    const cls = await Class.findById(classId)
  
    if (!cls) {
      throw new ApiError(400, 'Class not found for Attendance')
    }
    if (cls.teacherId.toString() !== teacherId.toString()) {
      throw new ApiError(403, 'Unauthorized to start QR for this class');
    }
    if (cls.status !== 'scheduled' && cls.status !== 'rescheduled') {
      throw new ApiError(400, 'Cannot start QR for cancelled class');
    }
  
    if (!isWithin20MinBeforeEnd(cls.date, cls.time)) {
      throw new ApiError(400, 'QR can only be generated 20 minutes before class ends');
    }
  
    if (cls.qrSession.isActive) {
      return res.status(200).json(
          new ApiResponse(
              200,
       { sessionId: cls.qrSession.sessionId,
       token: generateQRToken(classId, teacherId) },
         ));
    }

    const sessionId = crypto.randomUUID();
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 20 * 60 * 1000);
  
    cls.qrSession = {
      sessionId,
      startTime,
      endTime,
      isActive: true,
      lastTokenGenerated: startTime,
    };
    await cls.save()
  
    const token = generateQRToken(classId, teacherId);
  
    return res.status(201).json(
      new ApiResponse(
          201,
   { sessionId, token, expiresIn: 15 },
    'QR session started'
     )
    );
  } catch (error) {
    throw new ApiError(501, error?.message || "Server error in starting Qr session")
  }
})

const getQrToken = asyncHandler(async(req, res)=>{
   const { sessionId } = req.params;
   const teacherId = req.user._id;

  try {
    const cls = await Class.findOne({ 'qrSession.sessionId': sessionId });
  
    if (!cls || cls.teacherId.toString() !== teacherId.toString()) {
      throw new ApiError(403, 'Invalid session');
    }
  
    const now = new Date();
    if (now < cls.qrSession.startTime || now > cls.qrSession.endTime) {
      throw new ApiError(400, 'QR session not active');
    }
  
    const token = generateQRToken(cls._id.toString(), teacherId.toString());
    cls.qrSession.lastTokenGenerated = now;
    await cls.save();
  
    return  res.status(200).json(
      new ApiResponse(
          200, 
      { token, expiresIn: 15 },
       "Qr Token Generated Successfully"
  )) 
  } catch (error) {
    throw new ApiError(501,error?.message || "Server Error in generating Qr code")
  }
})

const endQrSession = asyncHandler(async(req, res)=>{
   const { classId } = req.params;
   const teacherId = req.user._id;
  
 try {
     const cls = await Class.findById(classId);
   
     if (!cls || cls.teacherId.toString() !== teacherId.toString()) {
       throw new ApiError(403, 'Unauthorized');
     }
   
     cls.qrSession.isActive = false;
     await cls.save();
   
    return res.status(200).json(
       new ApiResponse(
           200,
            {},
    'QR session ended'
   )
    )
 } catch (error) {
    throw new ApiError(501, error?.message || "Server Error in Ending Qr session")
 }
})

// Validate QR scan and mark attendance
 const scanQRForAttendance = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const studentId = req.user._id;

  const student = await User.findById(studentId);

  if (!student || student.role !== 'student') {
    throw new ApiError(403, 'Only students can scan QR');
  }

  try {
    const decoded = jwt.verify(token, process.env.QR_ACCESS_TOKEN);
    const { classId, teacherId, timestamp } = decoded;

    const now = Date.now();
    if (now - timestamp > 15000) { // 15 seconds
      throw new ApiError(401, 'Token expired');
    }

    const cls = await Class.findById(classId);
    if (!cls || cls.qrSession.isActive === false) {
      throw new ApiError(400, 'Invalid or inactive QR session');
    }

    // Check if student already marked present for this class
    const existingAttendance = await Attendance.findOne({
      classId,
      studentId,
    });

    if (existingAttendance) {
      throw new ApiError(400, 'Already marked present for this class');
    }

    // Mark attendance
    const attendance = await Attendance.create({
      classId,
      studentId,
      teacherId,
      method: 'manual',
      token,
    });

    // Update class stats (studentsPresent)
    cls.studentsPresent = (await Attendance.countDocuments({ classId }))
    .toString();
    await cls.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            attendance,
        'Attendance marked successfully'
            ));

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Invalid token for qr scan');
    }
    throw new ApiError(400, error.message || 'Invalid scan for the QR');
  }

})

 const getTodayClasses = asyncHandler(async (req, res) => {
  try {
    const teacherId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
  
    const classes = await Class.find({
      teacherId,
      date: { $gte: today, $lt: tomorrow },
      status: { $ne: 'cancelled' },
    }).populate('teacherId', 'fullname');

    return res.status(201).json(
       new ApiResponse(
            201,
            classes,
            "Classes fetched"
        ))
  
  } catch (error) {
    throw new ApiError(501,error?.message || "Server error in fetching Classes")
  }
})

const cancelClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const teacherId = req.user._id;

  try {
    const cls = await Class.findById(classId);
    if (!cls || cls.teacherId.toString() !== teacherId.toString()) {
      throw new ApiError(403, 'Unauthorized');
    }
  
    cls.status = 'cancelled';
    await cls.save();

   return res.status(200).json(
    new ApiResponse(
        200,
         cls, 
    'Class cancelled'
 ))

  } catch (error) {
    throw new ApiError(502,error?.message || "server error in Cancelling the class")
  }
})

const rescheduleClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { newDate, newTime, newRoom } = req.body;
  const teacherId = req.user._id;
try {
    
      const cls = await Class.findById(classId);
    
      if (!cls || cls.teacherId.toString() !== teacherId.toString()) {
        throw new ApiError(403, 'Unauthorized');
      }
    
      cls.date = new Date(newDate);
      cls.time = newTime;
      cls.room = newRoom;
      cls.status = 'rescheduled';
      
      await cls.save();
    
      return res.status(200).json(
        new ApiResponse(
            200,
            {cls}, 
        'Class rescheduled'))
    
} catch (error) {
throw new ApiError(501, error?.message || "Server error in Reseduled class")
}
})


export {
    startQrSession,
    getQrToken,
    endQrSession,
    scanQRForAttendance,
    getTodayClasses,
    cancelClass,
    rescheduleClass,
}