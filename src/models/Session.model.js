import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    login_time: {
        type: Date,
    },
    last_activity: {
        type: Date
    },
    device: {
        type: String
    }

}, { timestamps: true })


export const Session = mongoose.model('Session', sessionSchema) 