import { Router } from "express";
import { makeCallRequest,acceptCallReqest,ansToCall,initializeCall } from "../controllers/call.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js";
const router = Router();

router.route("/C/make-call-request")
    .post(verifyJWT,verifyIsOtpValidated,makeCallRequest)

router.route("/C/accept-call-request")
    .post(verifyJWT,verifyIsOtpValidated,acceptCallReqest)

router.route("/C/ans-to-call")
    .post(verifyJWT,verifyIsOtpValidated,ansToCall)

router.route("/C/initialize-call-ice-candidate")
    .post(verifyJWT,verifyIsOtpValidated,initializeCall)

export default router