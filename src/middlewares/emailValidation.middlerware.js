import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";


export const verifyIsOtpValidated = asyncHandler(async (req, _, next) => {
    try {
        const userId = req?.user?._id
            if (!userId) throw new ApiError(
                404,
                "User Not Found!"
            )
            if (!req?.user?.emailVerified)
                throw new ApiError(
                    401,
                    "Email verication required."
                )
        
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access")
    }
})