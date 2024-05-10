import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import os from "os"
const healthcheck = asyncHandler(async (req, res) => {
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                `Host Machine Name :: ${os.hostname()}`,
                "App is looking Healthy ❤️‍🩹❤️‍🩹"
            )
        )

})

export { healthcheck };