import mongoose, {Schema} from "mongoose";



const videoSchema= new Schema({
   
    videofile:{
       type: String,

    },
    thumbnail:{
        type: String,
        required: true
    },
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    duration:{
        type:true,
        required: true
    },
    isPublished:{
        type: Boolean,
        default: true
    },


},{timestamps:true})



export const Video = mongoose.model("Video", videoSchema)