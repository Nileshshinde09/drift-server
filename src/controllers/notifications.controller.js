import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { NotificationsMultiMedia } from "../models/notificationMedia.model.js"
const getRingtoneThumbnails = asyncHandler(
    async (req, res) => {
        const user = req?.user;
        try {
            if (!user) throw new ApiError(
                404,
                "User Not Found."
            )
            const ringtoneThumbnailsResponse = await NotificationsMultiMedia.find(
                {
                    resource_type:'image'
                }
            )
            if (!ringtoneThumbnailsResponse) throw new ApiError(
                401,
                "Something went wrong while getting ringtone music."
            )
            return res.
            status(200)
            .json(
                    new ApiResponse(
                        200,
                        {
                            ringtoneThumbnailsResponse
                        },
                        "Ringtone fetched successfully !"
                    )
                )
            } catch (error) {
                console.log(error.message || "Something went wrong while getting ringtone music.");
                throw new ApiError(
                    401,
                    error.message || "Something went wrong while getting ringtone music."
                )
            }
            }
        )
const getRingtoneMusicsListByDirName = asyncHandler(

    async (req, res) => {
        const user = req?.user;
        const { generParameter } = req?.params;
        if (!user) throw new ApiError(
            404,
            "User Not Found."
        )
        if (!generParameter) throw new ApiError(
            404,
            "gener Not Found."
        )
        const ringtoneResponse = await NotificationsMultiMedia.find(
            {
                resource_type:'video',
                folder:`notification_assets/music/${generParameter}`

            }
        )
        if (!ringtoneResponse) throw new ApiError(
            401,
            "Something went wrong while getting ringtone music."
        )
        return res.
            status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        ringtoneResponse
                    },
                    "Ringtone fetched successfully !"
                )
            )

    }
)

export {
    getRingtoneMusicsListByDirName,
    getRingtoneThumbnails
}