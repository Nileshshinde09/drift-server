import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {Likes} from "../models/likes.model.js"

const likeAndUnlikePost =asyncHandler(
    async (req,res)=>{
        const userId = req?.user?._id
        const {postId} = req?.body;
        if(!userId) throw new ApiError(
            404,
            "User not found"
        )
        if(!postId) throw new ApiError(
            404,
            "Post ID not found"
        )
        try {
            const isLikeExist = await Likes.findOne({
                PostId:postId,
                likedBy:userId
            })
            
            if(isLikeExist){
                const unlike = await Likes.findOneAndDelete({
                    PostId:postId,
                    likedBy:userId
                })
                if(!unlike) throw new ApiError(
                    400,
                    "something went wrong while unlikeing post"
                )
                return res.
                status(200)
                .json(
                    new ApiResponse(
                        200,
                        {
                            like:false
                        },
                        "Unlike post successfully! 🙁🙁"
                    )
                )
            }
            const createdLike= await Likes.create({
                PostId:postId,
                likedBy:userId
            })
            if(!createdLike) throw new ApiError(
                400,
                "Something went wrong while creating like instance in database"
            )
            return res.
                status(200)
                .json(
                    new ApiResponse(
                        200,
                        {
                            like:true
                        },
                        "like post successfully! 👍👍"
                    )
                )
        } catch (error) {
            throw new ApiError(
                400,
                error?.message|| "Something went wrong while creating like instance in database"
            )
        }

    }
)


const likeAndUnlikeComment =asyncHandler(
    async (req,res)=>{
        const userId = req?.user?._id
        const {commentId} = req?.body;
        if(!userId) throw new ApiError(
            404,
            "User not found"
        )
        if(!commentId) throw new ApiError(
            404,
            "comment ID not found"
        )
        try {
            const isLikeExist = await Likes.findOne({
                commentId,
                likedBy:userId
            })
            if(isLikeExist){
                const unlike = await Likes.findOneAndDelete({
                    commentId,
                    likedBy:userId
                })
                return res.
                status(200)
                .json(
                    new ApiResponse(
                        200,
                        {
                            like:false
                        },
                        "Unlike comment successfully! 👍👍"
                    )
                )
            }
            const createdLike= await Likes.create({
                postId:postId,
                likedBy:userId
            })
            if(!createdLike) throw new ApiError(
                400,
                "Something went wrong while creating like instance in database"
            )
            return res.
                status(200)
                .json(
                    new ApiResponse(
                        200,
                        {
                            like:true
                        },
                        "like comment successfully! 🙁🙁"
                    )
                )
        } catch (error) {
            throw new ApiError(
                400,
                error?.message|| "Something went wrong while creating like instance in database"
            )
        }

    }
)
export {
    likeAndUnlikePost,
    likeAndUnlikeComment
}