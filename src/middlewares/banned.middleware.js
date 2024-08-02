import { ApiResponse } from "../utils/ApiResponse.js"
import { Banned } from "../models/banned.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
const UserBanned = asyncHandler(
    async (req, res, next) => {
        const user = req.user;
        if (!user) throw new ApiError(  
            404,
            "User not found , unathorised access."
        )
        const bannedData = await Banned.findById(req.user._id);
        if (bannedData) {
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        {
                            bannedData
                        },
                        "User banned by the admin."
                    )
                )
        }
        return next();
    }
)
export {
    UserBanned
}