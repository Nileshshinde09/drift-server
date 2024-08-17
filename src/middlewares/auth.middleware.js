import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ACCESS_TOKEN_SECRET,RESET_FOROGT_PASSWORD_SECURITY_TOKEN_SECRET } from "../constants.js";


export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) throw new ApiError(401, "Unauthorized request")
        const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = user
        next()
    } catch (error){
        throw new ApiError(401,error?.message || "Invalid Access Token")
    }
})


export const verifyResetForgotPasswordJWT = asyncHandler(async (req, _, next) => {
    try {
        console.log(req);
        
        const token = req?.cookies?.resetforgotpasswordToken || req.header("Authorization")?.replace("Bearer ", "")
        
        
        if (!token) throw new ApiError(401, "Unauthorized request")
        const decodedToken = jwt.verify(token, RESET_FOROGT_PASSWORD_SECURITY_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = user
        next()
    } catch (error){
        throw new ApiError(401,error?.message || "Invalid Access Token")
    }
})