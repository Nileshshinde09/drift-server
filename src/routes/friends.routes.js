import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js";
import {makeAndRetrieveRequestByUserId,getRequestsAndInvitations,respondToInvitations,getAllFriends, checkIsFriends, removeFriendFromFriendList} from "../controllers/friends.controller.js"
const router = Router();

router.route("/make-or-retrieve-request")
    .post(verifyJWT,verifyIsOtpValidated,makeAndRetrieveRequestByUserId)

router.route("/L/get-all-requests-invitations")
    .get(verifyJWT,verifyIsOtpValidated,getRequestsAndInvitations)

router.route("/respond-to-invitation")
    .post(verifyJWT,verifyIsOtpValidated,respondToInvitations)

router.route("/check-is-friends/:remote_id")
    .get(verifyJWT,verifyIsOtpValidated,checkIsFriends)

router.route("/remove-from-friend-list/:requestId")
    .delete(verifyJWT,verifyIsOtpValidated,removeFriendFromFriendList)

router.route("/L/get-all-friends")
    .get(verifyJWT,verifyIsOtpValidated,getAllFriends)


export default router