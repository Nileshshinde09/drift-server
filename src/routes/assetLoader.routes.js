import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js";
import { loadAnoImageAssets,loadImageById } from "../controllers/cloudMediaLoader.controller.js";
import { getRingtoneMusicsListByDirName,getRingtoneThumbnails } from "../controllers/notifications.controller.js";
const router = Router();

router.route("/load-ano-assets")
    .get(verifyJWT,verifyIsOtpValidated,loadAnoImageAssets)
router.route("/load-image-by-id")
    .get(verifyJWT,verifyIsOtpValidated,loadImageById)
router.route("/get-ringtone-thumbnails")
    .get(verifyJWT,verifyIsOtpValidated,getRingtoneThumbnails)
router.route("/L/get-ringtone-music-list-by-dir-name/:generParameter")
    .get(verifyJWT,verifyIsOtpValidated,getRingtoneMusicsListByDirName)


export default router