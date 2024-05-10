import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js";
import { deleteImageContentFromCloudinary,deleteVideoContentFromCloudinary } from "../controllers/deleteContent.controller.js";

const router = Router();

router.route("/remove-image-content")
    .delete(verifyJWT,verifyIsOtpValidated,deleteImageContentFromCloudinary)

router.route("/remove-video-content")
    .delete(verifyJWT,verifyIsOtpValidated,deleteVideoContentFromCloudinary)

export default router