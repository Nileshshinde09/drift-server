import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js";
import {makeAndRetrieveRequestByUserId,getRequestsAndInvitations,respondToInvitations,getAllFriends} from "../controllers/friends.controller.js"

const router = Router();

router.route("/make-or-retrieve-request")
    .post(verifyJWT,verifyIsOtpValidated,makeAndRetrieveRequestByUserId)

router.route("/L/get-all-requests-invitations")
    .get(verifyJWT,verifyIsOtpValidated,getRequestsAndInvitations)

router.route("/respond-to-invitation")
    .get(verifyJWT,verifyIsOtpValidated,respondToInvitations)
router.route("/L/get-all-friends")
    .get(verifyJWT,verifyIsOtpValidated,getAllFriends)


export default router