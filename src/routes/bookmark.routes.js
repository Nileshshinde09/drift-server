import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js";
import { BookmarkAndUnbookmark,isBookmarked } from "../controllers/bookmark.controller.js";
const router = Router();

router.route("/B/bookmark-unbookmark")
    .post(verifyJWT,verifyIsOtpValidated,BookmarkAndUnbookmark)
router.route("/B/is-bookmarked")
    .get(verifyJWT,verifyIsOtpValidated,isBookmarked)

export default router