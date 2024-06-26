import { Router } from "express";
import { getUserProfileByUsername } from "../controllers/profile.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js";
import {updateAccountDetails} from "../controllers/user.controller.js"
const router = Router();

router.route("/S/get-profile/:username")
    .get(verifyJWT,verifyIsOtpValidated,getUserProfileByUsername)
router.route("/S/update-profile")
    .put(verifyJWT, verifyIsOtpValidated, updateAccountDetails)

export default router