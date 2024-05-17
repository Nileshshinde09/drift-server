import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js";
import { likeAndUnlikePost , likeAndUnlikeComment } from "../controllers/likes.controller.js"
const router = Router();

router.route("/L/like-unlike-post")
    .post( verifyJWT , verifyIsOtpValidated , likeAndUnlikePost )
    
router.route("/L/like-unlike-comment")
    .post( verifyJWT , verifyIsOtpValidated , likeAndUnlikeComment )

export default router