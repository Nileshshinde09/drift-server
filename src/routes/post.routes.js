import { uploadMultiple, uploadSingle, upload } from "../middlewares/multer.middleware.js";
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
    getPostById,
    getAllRemoteUserPost
} from "../controllers/post.controller.js"

const router = Router();
router.use(verifyJWT, verifyIsOtpValidated)
router.route("/create-post-with-images")
    .post(uploadMultiple, createPostWithImages)

router.route("/create-post-with-video")
    .post(uploadSingle, createPostWithVideo)

router.route("/get-all-posts")
    .get(getAllPost)

router.route("/get-post-by-id")
    .get(getPostById)

router.route("/get-all-user-owned-posts")
    .get(getAllUserOwnedPosts)

router.route("/update-post-content")
    .put(updatePostContentByPostId)

router.route("/update-post-images")
    .put(uploadMultiple, updatePostImagesByPostId)

router.route("/update-post-video")
    .put(upload.single('files'), updatePostVideosByPostId)

router.route("/get-all-Remote-User-Post/:username")   
    .get(getAllRemoteUserPost)

router.route("/delete-post")
    .delete(deletePost)

router.route("/get-feed-posts")
    .get(getPostFeed)

export default router

