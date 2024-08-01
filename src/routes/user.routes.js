import { Router } from "express";
import {
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
    resetForgotPassword,
    sendResetForgotPasswordEmail,
    resetForgotPasswordVerification
} from "../controllers/user.controller.js"
import { verifyJWT, verifyResetForgotPasswordJWT } from "../middlewares/auth.middleware.js";
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js";
import { UserBanned } from "../middlewares/banned.middleware.js";
const router = Router();



router.route("/current-user")
    .get(verifyJWT,verifyIsOtpValidated,UserBanned, getCurrentUser)

router.route("/register")
    .post(registerUser)

router.route("/login")
    .post(loginUser)

router.route("/refresh-token")
    .post(refreshAccessToken)

router.route("/logout")
    .post(verifyJWT, verifyIsOtpValidated, logoutUser)


router.route("/change-password")
    .post(verifyJWT, verifyIsOtpValidated, changeCurrentPassword)

router.route("/update-account")
    .post(verifyJWT, verifyIsOtpValidated, updateAccountDetails)

router.route("/generate-otp")
    .post(verifyJWT, generateOTP)

router.route("/validate-otp")
    .post(verifyJWT, validateOTP)


router.route("/check-unique-username")
    .get(isUsernameUnique)

router.route("/reset-forgot-password")
    .post(verifyResetForgotPasswordJWT, resetForgotPassword)

router.route("/send-reset-forgot-password-email")
    .post(sendResetForgotPasswordEmail)

router.route("/reset-forgot-password-page-verification")
    .post(verifyResetForgotPasswordJWT, resetForgotPasswordVerification)

export default router