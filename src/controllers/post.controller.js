import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Posts } from "../models/Posts.model.js"
import { Bookmark } from "../models/bookmarks.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { Images } from "../models/images.models.js"
import { Videos } from "../models/videos.model.js"
import { PostCommonAggregration } from "../utils/Aggregation/common/postCommonAggregation.js"
import { Comments } from "../models/comments.model.js"
import { Likes } from "../models/likes.model.js"
import { User } from "../models/user.model.js"
import { Follows } from "../models/follow.model.js"
import { removeImageContentFromCloudinary, removeVideoContentFromCloudinary } from "../utils/cloudinary.js"
import mongoose from "mongoose"

const processPosts = async (aggregatePosts) => {
    try {
        const processedPosts = await Promise.all(aggregatePosts.flatMap(user => {
            if (user.followeesPosts.length > 0) {
                return user.followeesPosts.map(async (newPost) => {
                    const postWithUserInfo = {
                        ...newPost,
                        isFollower: user.isFollower,
                        isbookmarked: user.isbookmarked,
                        isliked: user.isliked,
                        likes: user.likes,
                        comments: user.comments,
                        creator: {
                            _id: user._id,
                            username: user.username,
                            avatar: user.avatar,
                        },
                    };

                    if (!postWithUserInfo.video) {
                        postWithUserInfo.images = await Promise.all(postWithUserInfo.images.map(async (_id) => {
                            const img = await Images.findById(_id);
                            return img.URL;
                        }));
                    } else {
                        const v = await Videos.findById(postWithUserInfo.video);
                        postWithUserInfo.video = v.URL;
                    }
                    return postWithUserInfo;
                });
            } else {
                return [];
            }
        }));

        return processedPosts.flat().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } catch (error) {
        throw new ApiError(
            500,
            error.message || "Something went wrong while fetching media content URLs"
        );
    }
};

const commonImageUploader = async (req) => {
    return await Promise.all(req.files.map(async (filepath) => {
        try {
            const uploadedFile = await uploadOnCloudinary(filepath.path)
            if (!uploadedFile) throw new ApiError(
                500,
                "Something went wrong while uploading image file on Cloudinary"
            )
            const { width, height, secure_url, asset_id, public_id, original_filename, resource_type } = uploadedFile
            if (resource_type != "image") {
                throw new ApiError(
                    400,
                    "Resource type must be image."
                )
            }
            const uploadedImage = await Images.create({
                uploader: req?.user?._id,
                URL: secure_url,
                width,
                height,
                asset_id,
                public_id,
                original_filename,
                resource_type,
            })
            if (!uploadedImage) throw new ApiError(
                500,
                "Something went wrong while storing image in database !"
            )
            return uploadedImage

        } catch (error) {
            throw new ApiError(
                500,
                error.message || "Something went wrong while uploading image file"
            )
        }
    }))

}

const commonVideoUploader = async (req) => {
    try {
        if (!req.user) throw new ApiError(
            401,
            "User not found."
        )
        if (!req.file) throw new ApiError(
            404,
            "Video file not found, Provide file."
        )
        const uploadedFile = await uploadOnCloudinary(req?.file?.path)
        if (!uploadedFile) throw new ApiError(
            500,
            "Something went wrong while uploading video file on Cloudinary"
        )

        const { width, height, secure_url, asset_id, public_id, original_filename, resource_type } = uploadedFile
        if (resource_type != "video") {
            throw new ApiError(
                400,
                "Resource type must be Video."
            )
        }
        const uploadedVideo = await Videos.create({
            uploader: req?.user?._id,
            URL: secure_url,
            width,
            height,
            asset_id,
            public_id,
            original_filename,
            resource_type
        })
        if (!uploadedVideo) throw new ApiError(
            500,
            "Something went wrong while storing Video in database !"
        )
        return uploadedVideo

    } catch (error) {
        throw new ApiError(
            500,
            error.message || "Something went wrong while uploading video file."
        )
    }
}




const createPostWithImages = asyncHandler(
    async (req, res) => {
        const ownerId = req?.user?._id;
        const { tags = [], caption } = req.body;
        console.log(" images : ", req.files);
        if (!ownerId) throw new ApiError(
            400,
            "User not present, unauthorised access"
        )

        if (req.files.length <= 0) throw new ApiError(
            404,
            "images not found , Images are required to procceed."
        )

        const imageResponses = await commonImageUploader(req)
        console.log(imageResponses);
        if (!imageResponses) throw new ApiError(
            500,
            "someting went wrong while uploading images on cloudinary"
        )
        const postResponse = await Posts.create({
            ownerId,
            images: imageResponses.map((img) => img?._id),
            tags,
            caption
        })
        if (!postResponse) {
            throw new ApiError(
                500,
                "Something went while uploading post to database"
            )
        }

        const createdPost = await Posts.aggregate([
            {
                $match: {
                    _id: postResponse._id,
                },
            },
            {
                $addFields: {
                    ImageUrl: imageResponses.map((img) => img?.URL),
                }
            },
            ...PostCommonAggregration(req?.user?._id)
        ])

        return res.
            status(200).
            json(

                new ApiResponse(
                    200,
                    {
                        CreatedPost: createdPost[0]
                    },
                    "Post created successfully!"
                )
            )

    }
)

const createPostWithVideo = asyncHandler(
    async (req, res) => {
        const ownerId = req?.user?._id;
        const { tags = [], caption } = req.body;
        if (!ownerId) throw new ApiError(
            400,
            "User not present, unauthorised access"
        )
        if (!req.file) throw new ApiError(
            404,
            "video not found , video are required to procceed."
        )
        const uploadedVideo = await commonVideoUploader(req)
        if (!uploadedVideo) throw new ApiError(
            500,
            "someting went wrong while uploading video on cloudinary"
        )
        const postResponse = await Posts.create({
            ownerId,
            video: uploadedVideo._id,
            tags,
            caption
        })
        if (!postResponse) {
            throw new ApiError(
                500,
                "Something went while uploading post to database"
            )
        }
        const createdPost = await Posts.aggregate([
            {
                $match: {
                    _id: postResponse._id,
                },
            },
            {
                $addFields: {
                    VideoUrl: uploadedVideo.URL,
                }
            },
            ...PostCommonAggregration(req?.user?._id)
        ])

        return res.
            status(200).
            json(
                new ApiResponse(
                    200,
                    {
                        CreatedPost: createdPost[0]
                    },
                    "Post created successfully!"
                )
            )

    }
)

const getAllPost = asyncHandler(
    async (req, res) => {
        try {
            const fetchedPost = await Posts.aggregate([
                ...PostCommonAggregration(req?.user?._id)

            ])
            return res.
                status(200)
                .json(
                    new ApiResponse(
                        200,
                        {
                            fetchedPost: fetchedPost
                        },
                        "Post fetched successfully!"
                    )
                )
        } catch (error) {
            throw new ApiError(
                500,
                error.message || "Something went wrong while getting the posts"
            )
        }


    }
)


const getAllUserOwnedPosts = asyncHandler(
    async (req, res) => {
        const userId = req?.user?._id;
        if (!userId) throw new ApiError(
            404,
            "User not found, unauthorised access"
        )
        try {
            const fetchedPost = await Posts.aggregate([
                {
                    $match: {
                        ownerId: userId
                    }
                },
                ...PostCommonAggregration(req?.user?._id)

            ])
            return res.
                status(200)
                .json(
                    new ApiResponse(
                        200,
                        {
                            fetchedPost: fetchedPost
                        },
                        "Post fetched successfully!"
                    )
                )
        } catch (error) {
            throw new ApiError(
                500,
                error.message || "Something went wrong while getting the posts"
            )
        }



    }
)

const getPostById = asyncHandler(
    async (req, res) => {
        const userId = req?.user?._id;
        const { PostId } = req.query;
        if (!userId) throw new ApiError(
            404,
            "User not found, unauthorised access"
        )
        if (!PostId) throw new ApiError(
            404,
            "PostId Not Found !!"
        )
        try {
            const fetchedPost = await Posts.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(PostId)
                    }
                },
                ...PostCommonAggregration(req?.user?._id)

            ])
            return res.
                status(200)
                .json(
                    new ApiResponse(
                        200,
                        {
                            fetchedPost: fetchedPost
                        },
                        "Post fetched successfully!"
                    )
                )
        } catch (error) {
            throw new ApiError(
                500,
                error.message || "Something went wrong while getting the posts"
            )
        }



    }
)
const updatePostContentByPostId = asyncHandler(
    async (req, res) => {
        const userId = req?.user?._id
        const { tags, caption, postId } = req.body;
        if (!userId) throw new ApiError(
            404,
            "User not found, unauthorised access"
        )
        if (!postId) throw new ApiError(
            404,
            "Post ID not found , required to proceed"
        )
        if (!tags && !caption) throw new ApiError(
            404,
            "atleast one field required"
        )
        let updatedResponse = null;
        const _id = postId;
        if (tags && caption) {
            updatedResponse = await Posts.findByIdAndUpdate(
                _id,
                {
                    tags,
                    caption
                }
            )
        } else if (tags) {
            updatedResponse = await Posts.findByIdAndUpdate(
                _id,
                {
                    tags,
                }
            )
        } else if (caption) {

            updatedResponse = await Posts.findByIdAndUpdate(
                _id,
                {
                    caption
                }
            )
        }


        if (!updatedResponse) throw new ApiError(
            500,
            "something went wrong while updating post"
        )
        const updatedPost = await Posts.aggregate([
            {
                $match: {
                    _id: updatedResponse._id,
                },
            },
            ...PostCommonAggregration(req?.user?._id)

        ])
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        updatedPost: updatedPost[0]
                    }
                )
            )
    }
)
const updatePostImagesByPostId = asyncHandler(
    async (req, res) => {
        const userId = req?._id;
        const { postId } = req?.body;
        if (!userId) throw new ApiError(
            404,
            "User not present, unauthorised access"
        )
        if (!postId) throw new ApiError(
            404,
            "PostId not found required to proceed"
        )
        if (!req.files) throw new ApiError(
            404,
            "images not found , image are required to procceed."
        )
        try {
            const { images } = await Posts.findById(postId);
            let mediaRemoveResponse = null;
            if (images && images.length > 0) {
                const imagesDeletePromises = images.map(async (img_id) => {
                    const { public_id } = await Images.findByIdAndDelete(img_id);
                    return removeImageContentFromCloudinary(public_id);
                });
                mediaRemoveResponse = await Promise.all(imagesDeletePromises);
            }
            if (!mediaRemoveResponse) throw ApiError(
                500,
                "Something went wrong while removing images of post"
            )

            imageResponses = await commonImageUploader(req)

        } catch (error) {
            throw new ApiError(
                500,
                "Something went wrong while updating images of post"
            )
        }
        if (!imageResponses) throw new ApiError(
            500,
            "someting went wrong while uploading images on cloudinary"
        )
        const postResponse = await Posts.findByIdAndUpdate(
            _id = postId,
            {
                images: imageResponses.map((img) => img?._id),
            }
        )
        if (!postResponse) {
            throw new ApiError(
                500,
                "Something went while updating post to database"
            )
        }
        const updatedPost = await Posts.aggregate([
            {
                $match: {
                    _id: postResponse._id,
                },
            },
            ...PostCommonAggregration(req?.user?._id)

        ])

        return res.
            status(200).
            json(new ApiResponse(
                200,
                {
                    updatedPost: updatedPost[0]
                },
                "Post image updated successfully!"
            ))

    }
)
const updatePostVideosByPostId = asyncHandler(
    async (req, res) => {
        const userId = req?._id;
        const { postId } = req?.body;
        if (!userId) throw new ApiError(
            404,
            "User not present, unauthorised access"
        )
        if (!postId) throw new ApiError(
            404,
            "PostId not found required to proceed"
        )
        if (!req.file) throw new ApiError(
            404,
            "video not found , video are required to procceed."
        )
        try {
            const { video } = await Posts.findById(postId);

            if (video) {
                const { public_id } = await Videos.findByIdAndDelete(video);
                mediaRemoveResponse = await removeVideoContentFromCloudinary(public_id);
            }

        } catch (error) {
            throw new ApiError(
                500,
                "Something went wrong while removing video"
            )
        }
        if (!mediaRemoveResponse) throw new ApiError(
            500,
            "someting went wrong while uploading images on cloudinary"
        )
        const postResponse = await Posts.findByIdAndUpdate(
            _id = postId,
            {
                video: mediaRemoveResponse._id,
            }
        )
        if (!postResponse) {
            throw new ApiError(
                500,
                "Something went while updating video to database"
            )
        }
        const updatedPost = await Posts.aggregate([
            {
                $match: {
                    _id: postResponse._id,
                },
            },
            ...PostCommonAggregration(req?.user?._id)
        ])

        return res.
            status(200).
            ApiResponse(
                200,
                {
                    updatedPost: updatedPost[0]
                },
                "Post video updated successfully!"
            )

    }
)
const deletePost = asyncHandler(
    async (req, res) => {
        const { postId } = req.body;
        const userId = req?.user?._id
        if (!userId) throw new ApiError(
            404,
            "User not found"
        )
        if (!postId) throw new ApiError(
            404,
            "PostId not found"
        )
        try {
            const post = await Posts.findById(postId);
            const { images, video } = post;

            const postDeletePromise = Posts.findByIdAndDelete(postId);

            const commentsDeletePromise = Comments.deleteMany({ Posts: postId });

            const likesDeletePromise = Likes.deleteMany({ PostId: postId });
            const bookmarkedDeletePromise = Bookmark.deleteMany({
                PostId: postId
            })
            let mediaRemoveResponse = null;

            if (images && images.length > 0) {
                const imageDeletePromises = images.map(async (img_id) => {
                    const { public_id } = await Images.findByIdAndDelete(img_id);
                    return await removeImageContentFromCloudinary(public_id);
                });
                mediaRemoveResponse = await Promise.all(imageDeletePromises);
            } else if (video) {
                const { public_id } = await Videos.findByIdAndDelete(video);
                mediaRemoveResponse = await removeVideoContentFromCloudinary(public_id);
            }
            await Promise.all([
                postDeletePromise,
                commentsDeletePromise,
                likesDeletePromise,
                bookmarkedDeletePromise
            ]);
            if (mediaRemoveResponse && post)
                return res
                    .status(200)
                    .json(
                        new ApiResponse(
                            200,
                            {

                            },
                            "Post with attachments removed successfully!"
                        )
                    )
            throw new ApiError(
                500,
                "Something went wrong while removing attachments of post"
            )
        } catch (error) {
            throw new ApiError(
                500,
                "Something went wrong while removing attachments of post"
            )
        }
    }
)
const getPostFeed = asyncHandler(
    async (req, res) => {
        const userId = req?.user?._id;
        const { page = 1, limit = 20 } = req.query;
        if (!userId) throw new ApiError(
            404,
            "user not found , unauthorised access."
        )

        const followees = await Follows.aggregate(
            [
                {
                    $match: {
                        followerId: new mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "followeeId",
                        foreignField: "_id",
                        as: "followee",
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    username: 1,
                                    avatar: 1,

                                },

                            },
                            {
                                $lookup: {
                                    from: "follows",
                                    localField: "_id",
                                    foreignField: "followeeId",
                                    as: "isFollower",
                                    pipeline: [
                                        {
                                            $match:
                                            {
                                                followeeId: new mongoose.Types.ObjectId(userId)
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $addFields: {
                                    isFollower: {
                                        $cond: {

                                            if: {
                                                $gte: [
                                                    {
                                                        $size: "$isFollower",
                                                    },
                                                    1,
                                                ],
                                            },
                                            then: true,
                                            else: false
                                        }
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    from: "comments",
                                    localField: "_id",
                                    foreignField: "postId",
                                    as: "comments"
                                }
                            },
                            {
                                $lookup: {
                                    from: "likes",
                                    localField: "_id",
                                    foreignField: "PostId",
                                    as: "likes"
                                }
                            }, {
                                $lookup: {
                                    from: "likes",
                                    localField: "_id",
                                    foreignField: "PostId",
                                    as: "isliked",
                                    pipeline: [
                                        {
                                            $match: {
                                                likedBy: new mongoose.Types.ObjectId(userId)
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $lookup: {
                                    from: "bookmarks",
                                    localField: "_id",
                                    foreignField: "PostId",
                                    as: "isbookmarked",
                                    pipeline: [
                                        {
                                            $match: {
                                                BookmarkedBy: new mongoose.Types.ObjectId(userId)
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $addFields: {
                                    likes: { $size: "$likes" },
                                    comments: { $size: "$comments" },
                                }
                            },
                            {
                                $addFields: {
                                    isliked: {
                                        $cond: {
                                            if: {
                                                $gte: [
                                                    {
                                                        $size: "$isliked",
                                                    },
                                                    1,
                                                ],
                                            },
                                            then: true,
                                            else: false,
                                        },
                                    },

                                    isbookmarked: {
                                        $cond: {
                                            if: {
                                                $gte: [
                                                    {
                                                        $size: "$isbookmarked",
                                                    },
                                                    1,
                                                ],
                                            },
                                            then: true,
                                            else: false,
                                        },
                                    },
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    username: 1,
                                    avatar: 1,
                                    isFollower: 1,
                                    isbookmarked: 1,
                                    isliked: 1,
                                    likes: 1,
                                    comments: 1
                                }
                            }

                        ]
                    },
                },
                {
                    $addFields: {
                        followee: { $first: "$followee" },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        followee: 1,
                    },
                },
                {
                    $replaceRoot: {
                        newRoot: "$followee",
                    },
                },
                {
                    $lookup: {
                        from: "posts",
                        localField: "_id",
                        foreignField: "ownerId",
                        as: "followeesPosts"
                    }
                },
            ]
        )
        if (!followees)
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        404,
                        {
                            followees: null
                        },
                        "Post with attachments removed successfully!"
                    )
                )
        processPosts(followees)
            .then((result) => {
                return res
                    .status(200)
                    .json(
                        new ApiResponse(
                            200,
                            { followees: result },
                            "Feed Posts fetched successfully!"
                        )
                    );
            })
            .catch((error) => {
                throw new ApiError(
                    500,
                    error.message || "Something went wrong while fetching media content URLs"
                );
            });

    }
)
export {
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

}
