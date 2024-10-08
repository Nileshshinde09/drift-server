import { Router } from "express";
import {
    findUsersByUsername
} from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js";
const router = Router();

router.route("/find-user")
    .get(verifyJWT,verifyIsOtpValidated,findUsersByUsername)
    
export default router