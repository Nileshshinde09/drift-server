import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js";
import { BookmarkAndUnbookmark } from "../controllers/bookmark.controller.js";
const router = Router();

router.route("/B/bookmark-unbookmark")
    .post(verifyJWT,verifyIsOtpValidated,BookmarkAndUnbookmark)

export default router