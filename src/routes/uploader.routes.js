import { upload } from "../middlewares/multer.middleware.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js";
import { uploadImageContent,uploadVideoContent } from "../controllers/uploader.controller.js";
import { uploadAnoAvatar } from "../controllers/uploader.controller.js";
const router = Router();

router.route("/upload-image-content")
    .post(verifyJWT,verifyIsOtpValidated,upload.single('file'),uploadImageContent)

router.route("/upload-video-content")
    .post(verifyJWT,verifyIsOtpValidated,upload.single('file'),uploadVideoContent)

router.route("/upload-AnoAvatar")
    .post(verifyJWT,verifyIsOtpValidated,upload.single('file'),uploadAnoAvatar)

export default router