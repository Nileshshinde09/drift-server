import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Comments } from "../models/comments.model.js"
import mongoose from "mongoose"
const createCommentAndUpdateCommentOnPost = asyncHandler(
    async (req, res) => {
        const userId = req?.user?._id
        const { postId, content } = req?.body;
        if (!userId) throw new ApiError(
            404,
            "User not found"
        )
        if (!postId || !content) throw new ApiError(
            404,
            "Post ID and content not found"
        )
        try {
            const isCommentExist = await Comments.findOne({
                postId: postId,
                owner: userId
            })
            if (isCommentExist) {
                const editedComment = await Comments.findByIdAndUpdate(
                    isCommentExist._id,
                    {
                        content: content
                    },
                    { new: true }
                )

                if (!editedComment) throw new ApiError(
                    400,
                    "something went wrong while updating the comment"
                )
                return res.
                    status(200)
                    .json(
                        new ApiResponse(
                            200,
                            {
                                editedComment
                            },
                            "comment updated successfully!"
                        )
                    )
            }
            const createdComment = await Comments.create({
                postId: postId,
                content,
                owner: userId,
            })
            if (!createdComment) throw new ApiError(
                400,
                "Something went wrong while creating comment instance in database"
            )
            return res.
                status(200)
                .json(
                    new ApiResponse(
                        200,
                        {
                            createdComment
                        },
                        "comment post successfully!"
                    )
                )
        } catch (error) {
            throw new ApiError(
                500,
                error?.message || "Something went wrong while creating comment instance in database"
            )
        }

    }
)

const createCommentAndUpdateCommentOnComment = asyncHandler(
    async (req, res) => {
        const userId = req?.user?._id
        const { commentId = null, content = null } = req?.body;

        if (!userId) throw new ApiError(
            404,
            "User not found"
        )
        if (!commentId && !content) throw new ApiError(
            404,
            "Comment ID and content not found"
        )
        try {
            const isCommentExist = await Comments.findOne({
                commentId,
                owner: userId
            })
            if (isCommentExist) {
                const editedComment = await Comments.findByIdAndUpdate(
                    isCommentExist._id,
                    {
                        content: content
                    },
                    { new: true }
                )
                if (!editedComment) throw new ApiError(
                    400,
                    "something went wrong while updating the comment"
                )
                return res.
                    status(200)
                    .json(
                        new ApiResponse(
                            200,
                            {
                                editedComment
                            },
                            "comment updated successfully!"
                        )
                    )
            }
            const createdComment = await Comments.create({
                commentId,
                content,
                owner: userId,
            })
            if (!createdComment) throw new ApiError(
                400,
                "Something went wrong while creating comment instance in database"
            )
            return res.
                status(200)
                .json(
                    new ApiResponse(
                        200,
                        {
                            createdComment
                        },
                        "comment created successfully!"
                    )
                )
        } catch (error) {
            throw new ApiError(
                500,
                error?.message || "Something went wrong while creating comment instance in database"
            )
        }

    }
)



const deleteCommentOnComment = asyncHandler(
    async (req, res) => {
        const userId = req?.user?._id
        const { commentId } = req?.body;

        if (!userId) throw new ApiError(
            404,
            "User not found"
        )
        if (!commentId) throw new ApiError(
            404,
            "Comment ID not found"
        )
        try {
            const isCommentExist = await Comments.findOne({
                commentId,
                owner: userId
            })
            if (!isCommentExist) throw new ApiError(
                404,
                "Comment not found"
            )
            const deletedComment = await Comments.findOneAndDelete({
                commentId,
                owner: userId,
            })
            if (!deletedComment) throw new ApiError(
                400,
                "something went wrong while deleting the comment"
            )
            return res.
                status(200)
                .json(
                    new ApiResponse(
                        200,
                        {
                            deletedComment
                        },
                        "comment updated successfully!"
                    )
                )

        } catch (error) {
            throw new ApiError(
                500,
                error?.message || "Something went wrong while creating comment instance in database"
            )
        }

    }
)

const deleteCommenById = asyncHandler(
    async (req, res) => {
        const userId = req?.user?._id
        const { commentId } = req?.body;

        if (!userId) throw new ApiError(
            404,
            "User not found"
        )
        if (!commentId) throw new ApiError(
            404,
            "Comment ID not found"
        )
        try {
            const isCommentExist = await Comments.findOne({
                commentId,
                owner: userId
            })
            if (!isCommentExist) throw new ApiError(
                404,
                "Comment not found"
            )
            const deletedComment = await Comments.findOneAndDelete({
                commentId,
                owner: userId,
            })
            if (!deletedComment) throw new ApiError(
                400,
                "something went wrong while deleting the comment"
            )
            return res.
                status(200)
                .json(
                    new ApiResponse(
                        200,
                        {
                            deletedComment
                        },
                        "comment updated successfully!"
                    )
                )

        } catch (error) {
            throw new ApiError(
                500,
                error?.message || "Something went wrong while creating comment instance in database"
            )
        }

    }
)

const deleteCommentOnPost = asyncHandler(
    async (req, res) => {
        const userId = req?.user?._id
        const { postId } = req?.body;

        if (!userId) throw new ApiError(
            404,
            "User not found"
        )
        if (!postId) throw new ApiError(
            404,
            "Post ID not found"
        )
        try {
            const isCommentExist = await Comments.findOne({
                postId,
                owner: userId
            })
            if (!isCommentExist) throw new ApiError(
                404,
                "Comment not found"
            )
            const deletedComment = await Comments.findOneAndDelete({
                postId,
                owner: userId,
            })
            if (!deletedComment) throw new ApiError(
                400,
                "something went wrong while deleting the comment"
            )
            return res.
                status(200)
                .json(
                    new ApiResponse(
                        200,
                        {
                            deletedComment
                        },
                        "comment deleted successfully!"
                    )
                )

        } catch (error) {
            throw new ApiError(
                500,
                error?.message || "Something went wrong while creating comment instance in database"
            )
        }

    }
)


const getCommentById = asyncHandler(
    async (req, res) => {
        const userId = req?.user?._id
        const { commentId } = req?.body;

        if (!userId) throw new ApiError(
            404,
            "User not found"
        )
        if (!commentId) throw new ApiError(
            404,
            "Comment ID not found"
        )
        try {
            const isCommentExist = await Comments.findOne({
                _id: commentId,
                owner: userId
            })
            if (!isCommentExist) throw new ApiError(
                404,
                "Comment not found"
            )
            const commentsResponse = await Comments.findOne({
                _id: commentId,
                owner: userId,
            })
            if (!commentsResponse) throw new ApiError(
                400,
                "something went wrong while getting the comment"
            )
            return res.
                status(200)
                .json(
                    new ApiResponse(
                        200,
                        {
                            commentsResponse
                        },
                        "comment retrive successfully!"
                    )
                )

        } catch (error) {
            throw new ApiError(
                500,
                error?.message || "Something went wrong while retriving comment instance in database"
            )
        }

    }
)

const getAllCommentsOnComment = asyncHandler(
    async (req, res) => {
        const userId = req?.user?._id
        const { commentId } = req?.body;

        if (!userId) throw new ApiError(
            404,
            "User not found"
        )
        if (!commentId) throw new ApiError(
            404,
            "Comment ID not found"
        )
        try {
            const isCommentsExist = await Comments.find({
                commentId,
                owner: userId
            })
            if (!isCommentsExist) throw new ApiError(
                404,
                "Comments not found"
            )
            const commentsResponse = await Comments.find({
                commentId,
                owner: userId,
            })
            if (!commentsResponse) throw new ApiError(
                400,
                "something went wrong while getting the comments"
            )
            return res.
                status(200)
                .json(
                    new ApiResponse(
                        200,
                        {
                            commentsResponse
                        },
                        "comments retrive successfully!"
                    )
                )

        } catch (error) {
            throw new ApiError(
                500,
                error?.message || "Something went wrong while retriving comment instance in database"
            )
        }

    }
)


const getAllCommentsOnPost = asyncHandler(
    async (req, res) => {
        const userId = req?.user?._id
        const { postId } = req?.body;

        if (!userId) throw new ApiError(
            404,
            "User not found"
        )
        if (!postId) throw new ApiError(
            404,
            "Post ID not found"
        )
        try {
            const isCommentsExist = await Comments.find({
                postId
            })
            if (isCommentsExist.length <= 0)
                return res
                    .status(404)
                    .json(
                        new ApiResponse(
                            404,
                            [],
                            "Comments not found"
                        )
                    )

            const commentsResponse = await Comments.aggregate(
                [
                    {
                        $match: {
                            postId: new mongoose.Types.ObjectId(postId)
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "commentor",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        username: 1,
                                        email: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },

                ]
            )
            if (!commentsResponse[0]) throw new ApiError(
                400,
                "something went wrong while getting the comments"
            )
            return res.
                status(200)
                .json(
                    new ApiResponse(
                        200,
                        {
                            commentsResponse
                        },
                        "comments retrive successfully!"
                    )
                )

        } catch (error) {
            throw new ApiError(
                500,
                error?.message || "Something went wrong while retriving comment instance in database"
            )
        }

    }
)

export {
    createCommentAndUpdateCommentOnComment,
    createCommentAndUpdateCommentOnPost,
    deleteCommentOnComment,
    deleteCommentOnPost,
    getCommentById,
    getAllCommentsOnComment,
    getAllCommentsOnPost,
    deleteCommenById
}