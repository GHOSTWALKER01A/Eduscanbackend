import mongoose,{Schema} from "mongoose";


const gradeSchema = new Schema({
  studentId: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User',
     required: true 
    },
  semester: {
     type: Number,
     required: true
     },
  subject: {
     type: String,
     required: true
     },
  midSemester: {
     type: Number,
     min: 0,
     max: 20 
    },
  practicals: {
     type: Number,
     min: 0,
     max: 10 
    },
  semesterExam: {
     type: Number,
     min: 0,
     max: 70 
    },
  finalGrade: {
    type: Number,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
   default: Date.now
 },
},{timestamps: true});

export const Grade = mongoose.model('Grade', gradeSchema);


