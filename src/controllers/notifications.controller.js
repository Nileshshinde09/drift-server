import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const getAllNotificatoinOfUser=asyncHandler(
    async (req,res)=>{
        const user = req?.user;
        if(!user) throw new ApiError(
            404,
            "User Not Found."
        )

    }
)

const createNotifications = asyncHandler(
    async (req,res)=>{
        const user = req?.user;
        if(!user) throw new ApiError(
            404,
            "User Not Found."
        )

    }
)
