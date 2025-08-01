import mongoose, {Schema} from "mongoose";



const resourceSchema = new Schema({

    title:{
        type: String,
        required: [true, "Title is required"],
        trim : true
    },
   description:{
         type: String,
         trim: true,
         default: ""
   },
   type:{
        type: String,
        enum: ['pdf', 'video', 'image', 'other'],
        required:[true, 'Resource type is required']

    },
    fileurl:{
        type: String,
        required:[true, 'A file URL is required'],
      trim: true,
    },
    uploadedby:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:[ true,'Uploader information is required']
    },
},{timestamps: true})

export const Resource = mongoose.model('Resource',resourceSchema)