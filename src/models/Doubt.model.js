import mongoose, { Schema } from "mongoose";


const doubtSchema = new Schema({

    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true

    },
    subject: {
        type: String,
        required: true,
    },
    doubt_description: {
        type: String,
        required: true
    },
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    response: {
        type: String
    },
    response_type: {
        type: String,
        enum: ['text', 'photo', 'voice']
    },
    response_media_url: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Resolved'],
        default: 'Pending'
    },

}, { timestamps: true })


export const Doubt = mongoose.model('Doubt', doubtSchema)