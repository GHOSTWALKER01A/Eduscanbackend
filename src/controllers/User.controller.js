import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asynchandler.js"; 
import { uploadOnCloudinary } from "../utils/Cloudinary.js";





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

const registerUser= asyncHandler (async (req,res) => {
   


    const {fullname , email, registrationnumber,password,phonenumber,role} = req.body 

console.log("email", email);

  if (
    [fullname, email, password, registrationnumber,phonenumber,role].some((field)=>{
        field?.trim() === ""
    })
  ) {
    throw new ApiError(400,'All Field required')
    
  }
  const existedUser =   User.findOne({
    $or: [{ email },{ registrationnumber }, { fullname }]
  })
  if (existedUser) {
    throw new ApiError(400,'User already exist')
  }

  const profilephotolocalpath = await req.files?.profilephoto[0]?.path
   
  if (!profilephotolocalpath) {
    throw new ApiError(400, "Profile photo required")
  }

  const profilephoto = await uploadOnCloudinary(profilephotolocalpath)

  if (!profilephoto) {
    throw new ApiError(400,'Profile photo not uploaded')
  }

  
  const user = await User.create({
    fullname,
    email,
    password,
    registrationnumber,
    phonenumber,
    profilephoto: profilephoto.url,
    join_date: Date.now
  })
    
  const createdUser = await User.findById(user._id).select(
    "-password -refreshtoken"
  )
  if (!createdUser) {
    throw new ApiError(500,'user not registered please wait')
    
  }

  return res.status(201).json(
    new ApiResponse(
      200,
      {registerUser}

    )
  )

})

const loginUser = asyncHandler(async(req, res) => {
  const {email,password,registrationnumber} = req.body

 if (!email && !registrationnumber) {
  throw new ApiError(400, "registration no and email required")
}

const user = await User.findOne({
  $and : [{email},{registrationnumber}]
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
 
  return res.status(200).cookie("accessToken",accesstoken,option)
  .cookie("refreshToken",refreshtoken,option).json(
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



export {
   registerUser,
   loginUser,
   logoutUser,
   refreshaccessToken


}