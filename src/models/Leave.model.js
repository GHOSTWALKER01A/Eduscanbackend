import mongoose, { Schema } from "mongoose";


const leaveSchema = new Schema({

    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User is  required"]
    },
    leavetype: {
        type: String,
        enum: ['sick', 'personal', "Vacation", 'other'],
        required: [true, "Leave type is required"]
    },
    startdate: {
        type: Date,
        required: [true, "Start date is required"]
    },
    enddate: {
        type: Date,
        required: [true, "End date is required"]
    },
    reason: {
        type: String,
        required: [true, "Reason is required"],
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },

}, { timestamps: true })



export const Leave = mongoose.model('Leave', leaveSchema)