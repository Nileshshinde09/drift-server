import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { QueryMailToSupport, sendMail } from "../utils/mail.js"
import { EMAIL_ID_FOR_MAIL } from "../constants.js"
const EmailsToSupport = asyncHandler(
    async (req, res) => {
        const { userId, email, subject, content } = req.body;
        if (!req.user) throw new ApiError(
            404,
            "User not found, unauthorised access"
        )
        if ([userId, email, subject, content]
            .some((field) => field?.trim() === "")) {
            throw new ApiError(400, "All email fields are required")
        }
        try {

            const emailContent = QueryMailToSupport(subject, content);
            await sendMail(emailContent, EMAIL_ID_FOR_MAIL, subject);

        } catch (error) {
            throw new ApiError(
                500,
                error?.message || "Something went wrong while sending email"
            )
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "email/query send successfully!"
                )
            )
    }
)
const ReplyToQueryEmail = asyncHandler(
    async (req, res) => {
        const { userId, email, subject, content } = req.body;
        if (!req.user) throw new ApiError(
            404,
            "User not found, unauthorised access"
        )
        if ([userId, email, subject, content]
            .some((field) => field?.trim() === "")) {
            throw new ApiError(400, "All email fields are required")
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "email/query send successfully!"
                )
            )
    }
)
export {
    EmailsToSupport,
    ReplyToQueryEmail
}