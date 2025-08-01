import mongoose , {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'


const userSchema = new Schema({
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
    profilephoto:{
        type: String,
        required: [true,'Avatar is required']
        
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
    role:{
        type: String,
        enum:['User','Teacher','Admin'],
        required: true
        
    },
    join_date: {
    type: Date,
    default: Date.now,
  },
    refreshtoken:{
        type: String
    },
    device_id:{
        type: String,
        unique: true
    }
},{timestamps:true})

userSchema.pre("save", async function (next){

    if (!this.isModified("password")) 
        return next()
    
    
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken= function (){
    jwt.sign(
    {
        _id: this._id,
        email: this.email,
        fullname: this.fullname,
        registrationnumber: this.registrationnumber,
        role: this.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}

userSchema.methods.generateRefreshToken = function(){
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



export const User = mongoose.model("User",userSchema)