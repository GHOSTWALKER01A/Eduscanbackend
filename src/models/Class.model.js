import mongoose, { Schema } from "mongoose";
import { ApiError } from "../utils/ApiError.js";


const classSchema = new Schema({

  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
  },
  room: {
    type: String,
    required: true,
  },
  totalStudents: {
    type: Number,
    default: 0,
  },
  duration: {
    type: Number,
    default: 45, // minutes
  },
  end_time: {
    type: Date,
    default: Date.now
  },
  teacher_latitude: {
    type: Number,
    required: true
  },
  teacher_longitude: {
    type: Number,
    required: true
  },
  qrSession: {
    sessionId: { type: String },
    startTime: { type: Date },
    endTime: { type: Date },
    isActive: { type: Boolean, default: false },
    lastTokenGenerated: { type: Date },
  },
  status: {
    type: String,
    enum: ['scheduled', 'cancelled', 'rescheduled'],
    default: 'scheduled',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true })



 classSchema.pre('save', function (next){
  if (this.isModified('time') || this.isModified('date')) {
    const startMinutes = parseTimeToMintes(this.time)
    const start = new Date(this.date)
    start.setMinutes(startMinutes)
    this.end_time = new Date(start.getTime() + this.duration * 60 * 1000)
  }

  next()
 })

 const parseTimeToMinutes = (timeStr) =>{

  const [startTime] = timeStr.split(' - ')
  const match = startTime.match(/(\d+):(\d+)\s*(AM|PM)/)

  if (!match) {
    throw new ApiError(500, 'Invalid Time ')
  }

  let [ , hours, minutes, period ] = match;
  hours = parseInt(hours);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + parseInt(minutes);

 }


export const Class = mongoose.model('Class', classSchema)