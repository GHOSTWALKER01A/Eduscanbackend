import mongoose, { Schema } from "mongoose";



const scheduleSchema = new Schema({
  time: {
     type: String,
      required: true
     }, 
  startTime: {
     type: String
     },
  endTime: { 
    type: String 
    },  
  day: {
     type: String, 
     enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      required: true 
    },
  subject: {
     type: String,
      required: true
     },
  type: {
    type: String,
    enum: ['academic', 'arts', 'lab'],
    required: true 
    },
  branch: {
     type: String,
      required: true 
    },
  semester: {
     type: String,
      required: true 
    },
  room: {
     type: String, 
     required: true
     }, // Room number
  date: {
     type: Date,
      required: true 
    }, 
  teacherId: {
     type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
       required: true
     }, 
  isRecess: {
     type: Boolean,
      default: false 
    },
  createdAt: { 
    type: Date,
    default: Date.now 
  },
  rescheduledTo: {
     type: Date
     },
  rescheduledRoom: {
     type: String 
    },
  cancelledAt: {
     type: Date 
    },
  
    
}, { timestamps: true })


scheduleSchema.pre('save', function(next){
    if (this.isModified('time')) {
    const [start, end] = this.time.split(' - ');
    this.startTime = start?.trim();
    this.endTime = end?.trim();
  }
  next();
})


export const Schedule = mongoose.model("Schedule", scheduleSchema)