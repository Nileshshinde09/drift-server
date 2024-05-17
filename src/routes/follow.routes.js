import { Router } from "express";
import { getFollowersByUsername,followOrUnfollowByUsername,getFolloweesByUsername } from "../controllers/follow.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js";
const router = Router();

router.route("/L/followers/:username")
    .get(verifyJWT,verifyIsOtpValidated,getFollowersByUsername)

    router.route("/L/followedTobe/:username")
    .get(verifyJWT,verifyIsOtpValidated,followOrUnfollowByUsername)

    router.route("/L/followees/:username")
    .get(verifyJWT,verifyIsOtpValidated,getFolloweesByUsername)
export default router