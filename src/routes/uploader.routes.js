import { upload } from "../middlewares/multer.middleware.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js";
import { uploadImageContent,uploadThumbnails,uploadNotificationMusic,uploadVideoContent } from "../controllers/uploader.controller.js";
import { uploadAnoAvatar } from "../controllers/uploader.controller.js";

const router = Router();

router.route("/upload-image-content")
    .post(verifyJWT,verifyIsOtpValidated,upload.single('file'),uploadImageContent)

router.route("/upload-video-content")
    .post(verifyJWT,verifyIsOtpValidated,upload.single('file'),uploadVideoContent)

router.route("/admin/upload-AnoAvatar")
    .post(verifyJWT,verifyIsOtpValidated,upload.single('file'),uploadAnoAvatar)

router.route("/admin/upload-ringtone-thumbnails")
    .post(verifyJWT,verifyIsOtpValidated,upload.single('file'),uploadThumbnails)

router.route("/admin/upload-music")
    .post(verifyJWT,verifyIsOtpValidated,upload.single('file'),uploadNotificationMusic)

export default router

