import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Bookmark } from "../models/bookmarks.model.js"
const BookmarkAndUnbookmark = asyncHandler(
    async (req, res) => {
        const { postId } = req.body;
        if (!req.user) throw new ApiError(
            404,
            "User not found, unauthorised access"
        )
        if (!postId) throw new ApiError(
            404,
            "Post Id not found . 😰😰"
        )
        
        try {
            const isBookmarkPresent = await Bookmark.findOne({
                PostId:postId,
                BookmarkedBy: req?.user?._id
            })
            if (isBookmarkPresent) {
                const bookmarkDeleteResponse = await Bookmark.findByIdAndDelete(isBookmarkPresent?._id)
                if (!bookmarkDeleteResponse) throw new ApiError(
                    400,
                    "Something went while creating bookmarking post"
                )
                return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        {
                            bookmark: false
                        },
                        "post unbookmarked sucessfully!"
                    )
                )
            }
            const bookmarkResponse = await Bookmark.create(
                {
                    PostId:postId,
                    BookmarkedBy: req?.user?._id
                }
            )
            if (!bookmarkResponse) throw new ApiError(
                400,
                "Something went while creating bookmarking post"
            )
        } catch (error) {
            throw new ApiError(
                500,
                error.message || "Something went while creating bookmarking post"
            )
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        bookmark: true
                    },
                    "post bookmarked sucessfully!"
                )
            )
    }
)

export {
    BookmarkAndUnbookmark
}