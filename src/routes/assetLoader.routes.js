import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js";
import { loadAnoImageAssets,loadImageById } from "../controllers/cloudMediaLoader.controller.js";
const router = Router();

router.route("/load-ano-assets")
    .get(verifyJWT,verifyIsOtpValidated,loadAnoImageAssets)
router.route("/load-image-by-id")
    .get(verifyJWT,verifyIsOtpValidated,loadImageById)

export default router