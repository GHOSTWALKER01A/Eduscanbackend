import mongoose, {Schema} from "mongoose";



const scheduleSchema = new Schema({

    class_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true

    },
    days_of_week: {
        type: String,
        enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
        required: true
    },
    starttime:{
        type: String,
        required: true
    },
    endtime:{
        type:String,
        required:true
    },
    room:{
        type:String,
        required: true
    },
    
   
},{timestamps: true})





export const Schedule = mongoose.model("Schedule", scheduleSchema)