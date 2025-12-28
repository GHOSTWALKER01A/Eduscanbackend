import mongoose, { Schema } from "mongoose";


const attendanceSchema = new Schema({

  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  macHash: {
    type: String
  },
  student_latitude: {
    type: Number
  },
  student_longitude: {
    type: Number
  },
  scannedAt: {
    type: Date,
    default: Date.now,
  },
  method: {
    type: String,
    enum: ['auto', 'manual'],
    default: 'auto',
  },
  token: {
    type: String, // The QR token used
  },
  isValid: {
    type: Boolean,
    default: true,
  },
  status: {
     type: String,
     enum: ['present', 'absent'],
     default: 'present'
  },
}, { timestamps: true })




export const Attendance = mongoose.model('Attendance', attendanceSchema)