import { Router } from "express";
import {
    createCommentAndUpdateCommentOnComment,
    createCommentAndUpdateCommentOnPost,
    deleteCommentOnComment,
    deleteCommentOnPost,
    getCommentById,
    getAllCommentsOnComment,
    getAllCommentsOnPost,
    deleteCommenById
} from "../controllers/comments.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js";

const router = Router();

router.route("/C/create-update-comment-on-coment")
    .put(verifyJWT, verifyIsOtpValidated, createCommentAndUpdateCommentOnComment)

router.route("/C/create-update-comment-on-post")
    .put(verifyJWT, verifyIsOtpValidated, createCommentAndUpdateCommentOnPost)

router.route("/C/delete-comment-on-comment")
    .delete(verifyJWT, verifyIsOtpValidated, deleteCommentOnComment)

router.route("/C/delete-comment-by-id")
    .delete(verifyJWT, verifyIsOtpValidated, deleteCommenById)

router.route("/C/delete-comment-on-post")
    .delete(verifyJWT, verifyIsOtpValidated, deleteCommentOnPost)

router.route("/C/get-comment-by-Id")
    .get(verifyJWT, verifyIsOtpValidated, getCommentById)

router.route("/C/get-comments-on-comment")
    .get(verifyJWT, verifyIsOtpValidated, getAllCommentsOnComment)

router.route("/C/get-comments-on-post")
    .get(verifyJWT, verifyIsOtpValidated, getAllCommentsOnPost)

export default router