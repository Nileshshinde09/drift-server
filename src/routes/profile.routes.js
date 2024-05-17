import { Router } from "express";
import { getUserProfileByUsername } from "../controllers/profile.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js";
const router = Router();

router.route("/S/get-profile/:username")
    .get(verifyJWT,verifyIsOtpValidated,getUserProfileByUsername)


export default router