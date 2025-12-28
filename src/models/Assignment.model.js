import mongoose, {Schema} from "mongoose";


const assignmentSchema = new Schema({

studentId: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'User',
 required: true
 },
subject: {
 type: String,
 required: true 
},
description: {
 type: String, 
 required: true 
},
file: {
 type: String 
}, 
fileType: {
 type: String 
},
status: {
 type: String,
 enum: ['pending', 'submitted', 'graded'], 
 default: 'pending'
 },
createdAt: { 
 type: Date,
 default: Date.now 
},  

},{timestamps: true})


export const Assignment = mongoose.model('Assignment', assignmentSchema)

