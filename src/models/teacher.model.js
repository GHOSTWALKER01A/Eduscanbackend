import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'


const teacherSchema = new Schema({
    fullname:{
     type: String,
     required:[true,'Fullname is Required'],
     trim: true,
     index: true
    },
    email:{
        type: String,
        required:[ true,'Email is Required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password:{
        type: String,
        require:  [true,'Password id Required'],
        unique: true
    },
    avatar:{
        type: String,
        
    },
    registrationnumber:{
        type: Number,
        required:[ true,'Registration Number Required'],
        unique: true,
        index: true
    },
    phonenumber:{
        type:Number,
        required: [true,'Phone No is Required'],
        unique:true
    },
    refreshtoken:{
        type: String
    }
},{timestamps:true})

teacherSchema.pre("save",async function (next){

    if (!this.isModified("password")) {
        return next()
    }
    this.password = bcrypt.hash(this.password, 10)
    next()
})

teacherSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

teacherSchema.methods.generateAccessToken= function (){
    jwt.sign(
    {
        _id: this._id,
        email: this.email,
        fullname: this.fullname,
        registrationnumber: this.registrationnumber,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}

teacherSchema.methods.generateRefreshToken = function(){
    jwt.sign(
        {
            _id: this._id,
           
            registrationnumber: this.registrationnumber,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
        )
}



export const Teacher = mongoose.model("Teacher",teacherSchema)