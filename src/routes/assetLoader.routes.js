import { upload } from "../middlewares/multer.middleware.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js";
import { loadAnoImageAssets } from "../controllers/cloudMediaLoader.controller.js";
const router = Router();


// router.route("/load-image-content")
//     .post(verifyJWT,verifyIsOtpValidated,uploadImageContent)

// router.route("/load-video-content")
//     .post(verifyJWT,uploadVideoContent)

router.route("/load-ano-assets")
    .get(verifyJWT,verifyIsOtpValidated,loadAnoImageAssets)

export default router