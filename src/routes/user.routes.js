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
    findUsersByUsernameOrName
} from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js";
const router = Router();

router.route("/register")
    .post(registerUser)

router.route("/login")
    .post(loginUser)

router.route("/logout")
    .post(verifyJWT,verifyIsOtpValidated, logoutUser)

router.route("/refresh-token")
    .post(refreshAccessToken)

router.route("/change-password")
    .post(verifyJWT,verifyIsOtpValidated, changeCurrentPassword)

router.route("/current-user")
    .get(verifyJWT,getCurrentUser)

router.route("/update-account")
    .post(verifyJWT,verifyIsOtpValidated, updateAccountDetails)

router.route("/generate-otp")
    .post(verifyJWT,generateOTP)
    
router.route("/validate-otp")
    .post(verifyJWT,validateOTP)

router.route("/check-unique-username")
    .get(isUsernameUnique)

router.route("/find-user")
    .get(verifyJWT,verifyIsOtpValidated,findUsersByUsernameOrName)
    
export default router