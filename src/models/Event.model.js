import mongoose, { Schema } from "mongoose";



const eventSchema = new Schema({

   title: {
      type: String,
      required: [true, 'Event title is required']
   },
   description: {
      type: String,

   },
   date: {
      type: Date,
      required: [true, 'Event date is required'],
   },
   time: {
      type: String,
      required: [true, 'Event time is required'],

   },
   location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true
   },
   imageurl: {
      type: String,
      trim: true,
   },
   videourl: {
      type: String,
      trim: true,

   },
   uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
   },


}, { timestamps: true })



export const Event = mongoose.model('Event', eventSchema)
