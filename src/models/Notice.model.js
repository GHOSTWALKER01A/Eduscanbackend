import mongoose, { Schema } from "mongoose";


const noticeSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
    },
    file:{
    type: String,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true })


export const Notice = mongoose.model('Notice', noticeSchema)