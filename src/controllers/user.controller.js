import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken"
import { REFRESH_TOKEN_SECRET, EMAIL_OTP_EXPIRY, NotificationTypesEnum } from "../constants.js"
import { OTP } from "../models/OTP.model.js"
import { emailVerificationContent, sendMail, forgotPasswordContent } from "../utils/mail.js"
import mongoose from "mongoose"
import { ForgotPassword } from "../models/forgotPassword.model.js"
import { sendNotifications } from "../services/queue/notification.queue.js"
import { emitSocketEvent } from "../socket/index.js"

const validateOTP = asyncHandler(
    async (req, res) => {
        try {
            const userId = req?.user?._id
            const { incomingOTP } = req.body;
            console.log(incomingOTP);
            if (!userId) throw new ApiError(
                404,
                "User Not Found!"
            )
            if (!incomingOTP) throw new ApiError(
                404,
                "OTP Not Found!"
            )
            if (req?.user?.emailVerified)
                return res
                    .status(202)
                    .json(
                        new ApiResponse(
                            202,
                            {
                                emailVerified: true
                            },
                            "Already User validated 😎😎😊😊"
                        )
                    )
            const otp = await OTP.findOne({ userId })
            if (!otp) throw new ApiError(
                404,
                "Opt not present in database"
            )

            const isExpired = await otp.isOTPExpired();
            if (isExpired) return res.
                status(200)
                .json(
                    new ApiResponse(
                        400,
                        {
                            isExpired: true
                        },
                        "OTP Expired"
                    )
                )
            const isCorrect = await otp.isOTPCorrect(incomingOTP);
            if (!isCorrect) return res.
                status(200)
                .json(
                    new ApiResponse(
                        400,
                        {
                            isInvalid: true
                        },
                        "OTP Expired"
                    )
                )

            await User.findByIdAndUpdate(
                userId,
                {
                    emailVerified: true
                },
                {
                    new: true
                }
            )

            return res.
                status(202)
                .json(
                    new ApiResponse(
                        202,
                        {
                            emailVerified: true
                        },
                        "OTP validated Successfully! 😎😎😊😊"
                    )
                )
        } catch (error) {
            throw new ApiError(
                500,
                error?.message || "Something went wrong while validating OTP"
            )
        }


    }
)

const findUsersByUsername = asyncHandler(
    async (req, res) => {
        const userId = req?.user?._id;
        const username = req.query?.username;
        if (!userId) throw new ApiError(
            404,
            "User not found,unauthorised access."
        )
        if (!username) throw new ApiError(
            400,
            "Username requirred to check existance of user"
        )

        const escapeRegex = (string) => {
            return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&amp;');
        };
        const escapedSearchUsername = escapeRegex(username);
        // const users = await User.find({ username: { $regex: `.*${escapedSearchUsername}.*`, $options: 'i' } });
        const users = await User.aggregate(
            [
                {
                    $match: {
                        username: { $regex: `.*${escapedSearchUsername}.*`, $options: 'i' }
                    }
                },
                {
                    $lookup: {
                        from: "follows",
                        localField: "_id",
                        foreignField: "followeeId",
                        as: "isFollowing",
                        pipeline: [
                            {
                                $match: {
                                    followerId: new mongoose.Types.ObjectId(userId)
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: "follows",
                        localField: "_id",
                        foreignField: "followerId",
                        as: "isFollower",
                        pipeline: [
                            {
                                $match: {
                                    followerId: new mongoose.Types.ObjectId(userId)
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        isFollowing: {
                            $cond: {
                                if: {
                                    $gte: [
                                        {
                                            $size: "$isFollowing",
                                        },
                                        1,
                                    ],
                                },
                                then: true,
                                else: false,
                            },
                        },

                        isFollower: {
                            $cond: {
                                if: {
                                    $gte: [
                                        {
                                            $size: "$isFollower",
                                        },
                                        1,
                                    ],
                                },
                                then: true,
                                else: false,
                            },
                        },
                    }
                },
                {
                    $project: {
                        fullName:1,
                        username: 1,
                        avatar: 1,
                        email: 1,
                        isFollowing: 1,
                        isFollower: 1
                    }
                }
            ]
        )
        if (!users) throw new ApiError(
            "something went wrong fetching user from database"
        )
        if (!users[0]) return res.
            status(404)
            .json(
                new ApiResponse(
                    404,
                    {
                        users: null
                    },
                    "User not found !! 🙁🙁"
                )
            )
        return res.
            status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        users
                    },
                    "User found successfully 😊😊"
                )
            )

    }
)
const createProfile = asyncHandler(
    async (req, res) => {
        const userId = req.user?._id;
        const { dob, avatar, profileBanner, bio } = req.body;
        if (!userId) throw new ApiError(
            400,
            "User not found , unauthorised access"
        )
        if (
            [
                dob, avatar, profileBanner, bio
            ].some(
                (field) => field?.trim() === ""
            )
        ) {
            throw new ApiError(400, "All fields are required")
        }
        const user = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    dob, avatar, profileBanner, bio
                }
            },
            { new: true }
        ).select(
            "-password -refreshToken"
        )

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    user,
                    "Profine created successfully!"
                )
            )


    }
)
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save(
            {
                validateBeforeSave: false
            }
        )
        return {
            refreshToken,
            accessToken
        }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and Access Token ")
    }
}
const registerUser = asyncHandler(
    async (req, res) => {
        const {
            fullName, email, username, password, gender,
        } = req.body;
        if (
            [
                fullName, email, username, password, gender
            ].some(
                (field) => field?.trim() === ""
            )
        ) {
            throw new ApiError(400, "All fields are required")
        }

        const existedUserWithEmail = await User.findOne(
            {
                email
            }
        )

        if (existedUserWithEmail) throw new ApiError(409, "User with email already exists")

        const existedUserWithUsername = await User.findOne(
            {
                username
            }
        )
        if (existedUserWithUsername) throw new ApiError(409, "User with usename already exists")

        const user = await User.create({
            fullName,
            email,
            password,
            gender,
            username: username.toLowerCase()
        })
        const createdUser = await User.findById(user._id)
            .select(
                "-password -refreshToken"
            )
        if (!createdUser) throw new ApiError(500, "Something went wrong while registering the user")
        return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    createdUser,
                    "user register Successfully"
                )
            )
    }
)

const isUsernameUnique = asyncHandler(
    async (req, res) => {
        const username = req.query?.username;
        if (
            username.trim() == ""
        ) {
            throw new ApiError(400, "username is required")
        }

        const existedUserWithUsername = await User.findOne(
            {
                username
            }
        )
        if (existedUserWithUsername) return res
            .status(409)
            .json(
                new ApiResponse(
                    200,
                    { username },
                    "User Already exist"
                )
            )
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { username },
                    "user name is unique"
                )
            )
    }
)


const loginUser = asyncHandler(
    async (req, res) => {
        try {
            const { email, username, password } = req.body
            if (!email && !username) throw new ApiError(400, "username or email is required ")

            const user = await User.findOne(
                {
                    $or: [
                        { username }, { email }
                    ]
                }
            )
            if (!user) new ApiError(404, "User does not exist ")

            const isPasswordWalid = await user.isPasswordCorrect(password)
            if (!isPasswordWalid) throw new ApiError(401, "Invalid user credentials")

            const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user?._id)
            const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

            const options = {
                httpOnly: true,
                secure: true
            }
            return res
                .status(200)
                .cookie("accessToken", accessToken)
                .cookie("refreshToken", refreshToken, options)
                .json(
                    new ApiResponse(
                        200,
                        {
                            user: loggedInUser,
                            "refreshToken": refreshToken,
                            "accessToken": accessToken
                        },
                        "User logged in successfully!"
                    )
                )
        } catch (error) {
            throw new ApiError(
                500,
                error?.message || "Something went wrong while user login"
            )
        }
    }
)

const logoutUser = asyncHandler(
    async (req, res) => {

        try {
            await User.findByIdAndUpdate(
                req.user._id,
                {
                    $unset: {
                        refreshToken: 1
                    }
                },
                {
                    new: true
                }
            )

            const options = {
                httpOnly: true,
                secure: true
            }

            return res.
                status(200)
                .clearCookie("accessToken")
                .clearCookie("refreshToken", options)
                .json(
                    new ApiResponse(
                        200,
                        {},
                        "User logged out successfully!"
                    )
                )
        } catch (error) {
            throw new ApiError(
                500,
                error?.message || "Something went wrong while logging out user"
            );
        }
    }
)

const refreshAccessToken = asyncHandler(
    async (req, res) => {
        try {
            const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

            if (!incomingRefreshToken) new ApiError(
                401,
                "unauthorised request"
            )

            const decodedToken = jwt.verify(
                incomingRefreshToken,
                REFRESH_TOKEN_SECRET
            )
            const user = await User.findById(decodedToken?._id)
            if (!user) throw new ApiError(401, "Invalid refresh Token")
            if (incomingRefreshToken != user?.refreshToken) throw new ApiError(401, "Refresh Token expired or used")

            const options = {
                httpOnly: true,
                secure: true
            }

            const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user?._id)

            return res
                .status(200)
                .cookie("accessToken", accessToken)
                .cookie("refreshToken", newRefreshToken, options)
                .json(
                    new ApiResponse(
                        200,
                        { accessToken, refreshToken: newRefreshToken },
                        "Access token refreshed"
                    )
                )
        } catch (error) {
            throw new ApiError(
                401,
                error?.message || "Invalid refresh token"
            )
        }
    }
)

const changeCurrentPassword = asyncHandler(
    async (req, res) => {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user?._id)
        const isPasswordWalid = user.isPasswordCorrect(oldPassword)
        if (!isPasswordWalid) throw new ApiError(
            400,
            "Invalid old password"
        )
        user.password = newPassword
        await user.save(
            { validateBeforeSave: false }
        )
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Password changed successfully"))
    }
)

const getCurrentUser = asyncHandler(
    async (req, res) => {
        if (!req.user) throw new ApiError(
            404,
            "User not found , unauthorised access."
        )
        //  await sendNotifications(String(req.user._id),"Hi Myself nilesh",{},"URL",NotificationTypesEnum.FOLLOWERS)
        await User.findByIdAndUpdate(
            req.user._id,
            {
                status: "Online"
            }
        )
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    req.user,
                    "User fetched successfully!"
                )
            )
    }
)

const updateAccountDetails = asyncHandler(
    async (req, res) => {
        const incomingObject = req.body;
        if (!incomingObject) throw new ApiError(
            404,
            "Account details not found"
        )
        const filteredObj = {};
        let hasFilledField = false;

        for (const key in incomingObject) {
            if (incomingObject[key] !== "") {
                filteredObj[key] = incomingObject[key];
                hasFilledField = true;
            }
        }
        if (!hasFilledField)
            throw new ApiError(400, "Atleast one field required")
        if (filteredObj?.email) {
            const existedUserWithEmail = await User.findOne(
                {
                    email: filteredObj?.email
                }
            )
            if (existedUserWithEmail) throw new ApiError(409, "User with email already exists")
        }
        if (filteredObj?.username) {

            const existedUserWithUsername = await User.findOne(
                {
                    username: filteredObj?.username
                }
            )
            if (existedUserWithUsername) throw new ApiError(409, "User with usename already exists")
        }
        if (!filteredObj) throw new ApiError(400,
            "data not available"
        )
        if (filteredObj.avatar) {
            filteredObj.avatar = new mongoose.Types.ObjectId(filteredObj.avatar)
        }

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: filteredObj
            },
            { new: true }
        ).select(
            "-password -refreshToken"
        )

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    user,
                    "Account details updated successfully!"
                )
            )
    }
)

const generateOTP = asyncHandler(
    async (req, res) => {
        try {
            const userId = req.user?._id
            if (!userId) throw new ApiError(
                404,
                "User Not Found!"
            )
            if (req?.user?.emailVerified)
                return res
                    .status(202)
                    .json(
                        new ApiResponse(
                            202,
                            {
                                emailVerified: true
                            },
                            "Already User validated 😎😎😊😊"
                        )
                    )
            const generateOTP = length => Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
            const otp = generateOTP(6)
            const ExpiryAt = new Date(Date.now() + EMAIL_OTP_EXPIRY * 60 * 1000);
            const generatedOTP = await OTP.create(
                {
                    userId,
                    otp,
                    ExpiryAt
                }
            )
            if (!generatedOTP) throw new ApiError(
                500,
                "Something went wrong while generating OTP"
            )
            try {

                const emailContent = emailVerificationContent(req.user?.username, generatedOTP.otp);
                await sendMail(emailContent, req.user.email, "Drift Email Verification OTP");

            } catch (error) {
                throw new ApiError(
                    500,
                    error?.message || "Something went wrong while sending OTP with email"
                )
            }
            return res.
                status(201)
                .json(
                    new ApiResponse(
                        201,
                        {},
                        "OTP generated Successfully!"
                    )
                )
        } catch (error) {
            throw new ApiError(
                500,
                error?.message || "Something went wrong while generating OTP"
            )
        }


    }
)

const sendResetForgotPasswordEmail = asyncHandler(
    async (req, res) => {
        if (!req) throw new ApiError(
            404,
            "Request not found !"
        )
        const { email, passwordResetUrl } = req?.body;
        if (!email) throw new ApiError(
            404,
            "Email Not Found!"
        )
        const user = await User.findOne({
            email
        })
        if (!user)
            return res.
                status(200)
                .json(
                    new ApiResponse(
                        404,
                        {},
                        "Email Id not Found"
                    )
                )
        const token = await user.generateResetPasswordSecurityToken()
        const URL = `${passwordResetUrl}${token}`
        try {
            const emailContent = forgotPasswordContent(user?.username, URL);
            await sendMail(emailContent, user.email, "Drift Reset Forgot Password Email.");
            const isUserExist = await ForgotPassword.findOne({
                userId: user._id,
            })
            let forgotPasswordResponse = null;
            if (!isUserExist) {
                forgotPasswordResponse = await ForgotPassword.create({
                    userId: user._id,
                    resetPasswordToken: token
                })
            } else {
                forgotPasswordResponse = await ForgotPassword.findByIdAndUpdate(
                    isUserExist._id,
                    {
                        resetPasswordToken: token
                    }
                )
            }
            if (forgotPasswordResponse) {
                return res.status(200)
                    .json(
                        new ApiResponse(
                            200,
                            {},
                            "Email Send Successfully !"
                        )
                    )
            }

        } catch (error) {
            throw new ApiError(
                500,
                error?.message || "Something went wrong while sending OTP with email"
            )
        }

    }
)

const resetForgotPassword = asyncHandler(
    async (req, res) => {
        if (!req?.user) throw new ApiError(
            404,
            "User Not Found, Unauthorised Request !"
        )
        const { newPassword } = req.body;

        if (!newPassword) throw new ApiError(
            404,
            "New Password Not Found"
        )
        const user = await User.findById(req.user?._id)
        user.password = newPassword
        await user.save(
            { validateBeforeSave: false }
        )
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Password changed successfully"))
    }

)
const resetForgotPasswordVerification = asyncHandler(
    async (req, res) => {
        if (!req?.user) throw new ApiError(
            404,
            "User Not Found, Unauthorised Request!"
        )

        return res
            .status(200)
            .clearCookie("resetforgotpasswordToken")
            .json(new ApiResponse(200, {}, "Page Load Verification Successfully!"))
    }

)

export {
    resetForgotPasswordVerification,
    generateAccessAndRefreshTokens,
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    generateOTP,
    validateOTP,
    isUsernameUnique,
    createProfile,
    findUsersByUsername,
    resetForgotPassword,
    sendResetForgotPasswordEmail
}