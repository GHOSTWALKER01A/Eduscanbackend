import mongoose,{Schema}from "mongoose";


const classSchema = new Schema({

    name:{
        type: String,
        required: true,
    },
    teacher_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

},{timestamps: true})


export const Class = mongoose.model('Class',classSchema)