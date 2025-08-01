import mongoose, {Schema} from "mongoose";


const doubtSchema = new Schema({

    student_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true

    },
    subject:{
        type : String,
        required: true,
    },
    doubt_description:{
        type: String,
        required: true
    },
    status:{
        type: String,
        enum:['Pending','Resolved'],
        default: 'Pending'
    },
    response:{
        type: String
    } 

},{timestamps: true}) 


export const Doubt = mongoose.model('Doubt', doubtSchema)