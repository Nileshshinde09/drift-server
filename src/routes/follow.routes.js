import { Router } from "express";
import { getFollowersByUsername,followOrUnfollowByUsername,getFolloweesByUsername,isFollowed } from "../controllers/follow.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js";
const router = Router();

router.route("/L/followers/:username")
    .get(verifyJWT,verifyIsOtpValidated,getFollowersByUsername)

router.route("/L/followed-unfollowed-to-be/:username")
    .get(verifyJWT,verifyIsOtpValidated,followOrUnfollowByUsername)

router.route("/L/followees/:username")
    .get(verifyJWT,verifyIsOtpValidated,getFolloweesByUsername)

router.route("/L/is-follwed/:username")
    .get(verifyJWT,verifyIsOtpValidated,isFollowed)

export default router