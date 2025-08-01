import mongoose,{Schema} from "mongoose";


const attendanceSchema = new Schema({

    student_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    class_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    date:{
        type: Date,
        required: true
    },
    duration:{
    type: Number,
    default: 0,
    },
    status:{
        type: String,
        enum:['Present','Absent','Late'],
        required: [true,"Attendence status is required"]
    }
},{timestamps: true})




export const Attendance = mongoose.model('Attendance',attendanceSchema)