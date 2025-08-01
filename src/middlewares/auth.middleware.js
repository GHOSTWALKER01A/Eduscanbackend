
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";



export const verifyJWT =  asyncHandler(async(req, res, next)=>{
    try {
        const Token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
     
        if (!Token) {
            throw new ApiError(401, "Invalid Request")
        }
    
        const decodedtoken = await jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET)
    
       const user = await  User.findById(decodedtoken?._id).select("-password -refreshtoken")
    
       if (!user) {
        throw new ApiError(401, "Invalid Access token")
        
       }
    
       req.user = user;
       next()
    
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid token ")
    }


})