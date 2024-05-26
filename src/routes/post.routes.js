import { uploadMultiple,upload } from "../middlewares/multer.middleware.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js";
import {
    createPostWithImages,
    createPostWithVideo,
    getAllPost,
    updatePostContentByPostId,
    updatePostImagesByPostId,
    updatePostVideosByPostId,
    deletePost,
    getPostFeed,
    getAllUserOwnedPosts,
    getPostById
} from "../controllers/post.controller.js"
const router = Router();

router.route("/create-post-with-images")
    .post(verifyJWT, verifyIsOtpValidated, uploadMultiple, createPostWithImages)

router.route("/create-post-with-video")
    .post(verifyJWT, verifyIsOtpValidated, upload.single('file'), createPostWithVideo)

router.route("/get-all-posts")
    .get(verifyJWT, verifyIsOtpValidated, getAllPost)

router.route("/get-post-by-id")
    .get(verifyJWT, verifyIsOtpValidated, getPostById)


router.route("/get-all-user-owned-posts")
    .get(verifyJWT, verifyIsOtpValidated, getAllUserOwnedPosts)

router.route("/update-post-content")
    .put(verifyJWT, verifyIsOtpValidated, updatePostContentByPostId)

router.route("/update-post-images")
    .put(verifyJWT, verifyIsOtpValidated, uploadMultiple, updatePostImagesByPostId)

router.route("/update-post-video")
    .put(verifyJWT, verifyIsOtpValidated, upload.single('file'), updatePostVideosByPostId)

router.route("/delete-post")
    .delete(verifyJWT, verifyIsOtpValidated, deletePost)

router.route("/get-feed-posts")
    .get(verifyJWT, verifyIsOtpValidated,getPostFeed)
    
export default router


