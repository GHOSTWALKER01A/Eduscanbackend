import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
import crypto from "crypto-js";


const userSchema = new Schema({
    fullname: {
        type: String,
        required: [true, 'Fullname is Required'],
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: [true, 'Email is Required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        require: [true, 'Password id Required'],
        unique: true,
        trim: true
    },
    profilephoto: {
        type: String,
        // required: [true, 'Avatar is required']

    },
    
    registrationno: {
        type: Number,
        required: [true, 'Registration Number Required'],
        unique: true,
        index: true,
        trim: true
    },

    semester: {
        type: Number,
        required: [true, 'Require to fill the Semester'],
        default: ''
    },

    phonenumber: {
        type: Number,
        required: [true, 'Phone No is Required'],
        unique: true,
        trim: true
    },

    subject:{
       type:String,
       trim: true,
       required: [true, 'Subject is Required'],
       default: ''
    },

    branch: {
       type: String,
        required: [true, 'Branch is Reqired '],
       default: '' 
    },

    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student',
        required: true
    },

    join_date: {
        type: Date,
        default: Date.now,
    },
    macAddress: {
        type: String,
    },
    macHash: {
        type: String 
    },
    latitude: {
        type: Number 
    },
    longitude: { 
        type: Number 
    },
    refreshtoken: {
        type: String,
        default: ''
    },

}, { timestamps: true })

userSchema.pre("save", async function (next) {

 if (!this.isModified("password")) {
        return next()
    }


    this.password = await bcrypt.hash(this.password, 10)
    
    if (this.macAddress && !this.macHash) {
    this.macHash = crypto.createHash('sha256').update(this.macAddress).digest('hex');
  }
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullname: this.fullname,
            registrationno: this.registrationno,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    jwt.sign(
        {
            _id: this._id,

        },

        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}



export const User = mongoose.model("User", userSchema)