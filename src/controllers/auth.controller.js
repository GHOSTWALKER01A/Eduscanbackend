import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asynchandler.js"; 
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt' 





const generateAccessandRefreshtoken = async(userId) => {
  try {

    const user = await User.findById(userId)
   const accesstoken =  user.generateAccessToken()
   const refreshtoken = user.generateRefreshToken()

   user.refreshtoken = refreshtoken
   await user.save({validateBeforeSave : false})

   return {accesstoken, refreshtoken}

  } catch (error) {
    throw new ApiError(500, "something went wrong while generating token")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, registrationno, password, semester, branch, phonenumber, subject, role } = req.body;

  if (
    [fullname, email, password, registrationno, semester, subject, phonenumber, role].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields required");
  }

if (role === 'student' && (!semester?.trim() || !branch?.trim() || !registrationno?.trim())) {
    throw new ApiError(400, 'Semester, branch, and registration number are required for students');
  }
  if (role === 'teacher' && (!subject?.trim() || !registrationno?.trim())) {
    throw new ApiError(400, 'Subject and registration number are required for teachers');
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { registrationno }, { fullname }]
  });

  if (existedUser) {
    throw new ApiError(400, "User already exists");
  }

  const profilephotolocalpath = req.files?.profilephoto?.[0]?.path;

  if (!profilephotolocalpath) {
    throw new ApiError(400, "Profile photo required");
  }

  const profilephoto = await uploadOnCloudinary(profilephotolocalpath);

  const user = await User.create({
    fullname,
    email,
    password,
    registrationno: registrationno || '',
    semester: semester || '',
    branch: semester || '',
    subject: subject || '',
    phonenumber,
    profilephoto:profilephoto.url,
    role,
    join_date: Date.now()
  });

  const createdUser = await User.findById(user._id).select("-password -refreshtoken");
  if (!createdUser) {
    throw new ApiError(500, "User not registered, please try again");
  }

const { accesstoken, refreshtoken } = await generateAccessandRefreshtoken(user._id)

const options = {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production", 
    secure: true
    // sameSite: "strict",
  };



  return res.status(201)
  .cookie("accessToken", accesstoken, options)
  .cookie("refreshToken", refreshtoken, options)
  .json(
    new ApiResponse(
      201,
     {user: createdUser, accesstoken, refreshtoken},
     "User registered successfully"
    )
  );
});

const loginUser = asyncHandler(async(req, res) => {
  const {fullname,registrationno,email,password} = req.body

 if (!fullname && !email && !registrationno && password) {
  throw new ApiError(400, "registration no and email required")
}

const user = await User.findOne({
  $or : [{email},{registrationno}]
})

if (!user) {
  throw new ApiError(400,"User not exist")
}

 const isPasswordCorrect = await user.isPasswordCorrect(password)
  
 if (!isPasswordCorrect) {
  throw new ApiError(400, "incorrect password")
 }

 const {refreshtoken,accesstoken} =  await generateAccessandRefreshtoken(user._id)

  const loggedinUser = await User.findById(user._id).select("-password  -refreshtoken")


  const option = {
    httpOnly: true,
    secure: true
  }
 
  return res.status(200)
  .cookie("accessToken",accesstoken,option)
  .cookie("refreshToken",refreshtoken,option)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedinUser , accesstoken, refreshtoken
      },
      "User logged in   Successfully"
    )
  )
})

const logoutUser = asyncHandler(async(req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshtoken: undefined
      }
    },
    {
      new : true
    }
  )
  const option = {
    httpOnly: true,
    secure: true
  }


  return res.status(200)
  .clearCookie("accessToken",option)
  .clearCookie("refreshToken",option)
  .json(
    new ApiResponse(200, {}, "User Logged Out")
  )
    
})

const refreshaccessToken = asyncHandler(async(req, res)=>{
  try {
    const incommingRefreshtoken = req.cookies.refreshtoken || req.body.refreshtoken
  
    if (!incommingRefreshtoken) {
      throw new ApiError(401, "unauthorized request")
    }
  
    const decodedtoken = jwt.verify(
      incommingRefreshtoken,
      process.env.REFRESH_TOKEN_SECRET
    )
  
    const user = await User.findById(decodedtoken?._id)
  
    if (!user) {
      throw new ApiError(401, "not found access token")
    }
  
    if (incommingRefreshtoken !== user?.refreshtoken) {
      throw new ApiError(402, "refresh token is expired or used")
    }
  
    const option = {
      httpOnly: true,
      secure: true
    }
  
    const {accesstoken, newrefreshtoken} = await generateAccessandRefreshtoken(user._id)
      
  
   return res.status(200)
   .cookie("accessToken", accesstoken,option)
   .cookie("refreshToken",newrefreshtoken,option)
   .json(
    new ApiResponse(
      200,
      {accesstoken,refreshtoken: newrefreshtoken},
      "Access token refreshed"
    )
   )
  } catch (error) {
    throw new ApiError(400,error?.message || "Invalid refresh token"
    )
  }

}) 


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ghostwalker01a@gmail.com',
    pass: 'APP Password'
  }
})


const users = new Map()

const otpStore = new Map()

const generatedOTP = ()=>{
   return Math.floor(100000 + Math.random() * 900000).toString()
}

function isValidEmail(email) {
  return email && email.endsWith('@bitsindri.ac.in');
}


const sendOTP = asyncHandler(async(req, res) => {
  const { email } = req.body

  if (!email || !isValidEmail(email)) {
    throw new ApiError(400, 'Please enter a valid @bitsindri.ac.in email');
  }

  if (users.has(email)) {
    users.set(email,{password: await bcrypt.hash('defaultPassword', 10)})
  }

  const otp = generatedOTP()
  otpStore.set(email, {otp, expires: Date.now() + 5 * 60 * 1000 })

  const mailOptions = {
    from: 'ghostwalker01a@gmail.com',
    to: email,
    subject: 'Your OTP for Password Reset',
    text: `Your OTP is: ${otp}. It is valid for 5 minutes.`
  }

  try {
   const sentinfo = await transporter.sendMail(mailOptions)
   console.log(`OTP sent to ${email}: ${info.messageId}`);

   return res.status(201).json(
    new ApiResponse(
      '201',
      {message: sentinfo.messageId},
      'OTP sent successfully'
    )
   )

    
  } catch (error) {
    console.error('Email send error:', error);
    throw new ApiError(500, error?.message || 'Failed to send OTP')
    
  }
})

const verifyOTP = asyncHandler(async(req, res)=>{
  const { email, otp } = req.body

  if (!email || !otp || !isValidEmail(email)) {
    throw new ApiError(400, 'Valid email and OTP are required');
  }

  const storedOTP = otpStore.get(email)

  if (!storedOTP) {
    throw new ApiError(400,  'OTP not found or expired' )
  }

  if ( storedOTP.expires < Date.now()) {
    otpStore.delete(email);
    throw new ApiError(400,  'OTP expired' )
  }

  if (storedOTP.otp === otp) {
    throw new ApiError(400, 'Invalid OTP')
  }
  
  otpStore.delete(email)

  return res.status(201).json(
   new ApiResponse(
     '201',
     null,
     'OTP verified successfully'
   )
  )


})

const resetPassword = asyncHandler(async(req, res)=>{
  const { email, newPassword } = req.body

 if (!email || !newPassword || !isValidEmail(email)) {
    throw new ApiError(400, 'Valid email and new password are required');
  }

  if (!users.has(email)) {
    throw new ApiError(400, 'User not found')
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    users.set(email, { password: hashedPassword })
   console.log(`Password reset for ${email}`);


   return res.status(201).json(
    new ApiResponse( 
      201,
      {email},
      'Password reset successfully'
    )
   )
  } catch (error) {
   console.error('Error resetting password:', error);
    throw new ApiError(500,'Failed to reset password'  ) 
  }

})



export {
   registerUser,
   loginUser,
   logoutUser,
   refreshaccessToken,
   sendOTP,
   verifyOTP,
   resetPassword


}