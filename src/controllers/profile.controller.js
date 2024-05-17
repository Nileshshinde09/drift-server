import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { Bookmark } from "../models/bookmarks.model.js"

const getUserProfileByUsername = asyncHandler(
    async (req, res) => {
        if (!req.user) throw new ApiError(
            404,
            "User not found unauthorised access."
        )
        const { username } = req.params
        if (!username) throw new ApiError(
            404,
            "Username not found."
        )
        const accountDetails = await User.aggregate(
            [
                {
                    $match: {
                        username: username
                    }
                },
                {
                    $lookup:{
                        from:"follows",
                        localField:"_id",
                        foreignField:"followeeId",
                        as:"FollwersList"
                    }
                },
                {
                    $lookup: {
                        from: "bookmarks",
                        localField: "_id",
                        foreignField: "BookmarkedBy",
                        as: "BookmarksList",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "posts",
                                    localField: "PostId",
                                    foreignField: "_id",
                                    as: 'BookmarkedPosts'
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        bookmarkCount: { $size: "$BookmarksList" },
                    }
                },
                // {

                //     $unwind: "$BookmarksList"

                // },
                {
                    $project: {
                        username: 1,
                        fullName: 1,
                        gender: 1,
                        dob: 1,
                        avatar: 1,
                        profileBanner: 1,
                        bio: 1,
                        status: 1,
                        BookmarkedPosts: "$BookmarksList.BookmarkedPosts",
                        bookmarkCount: 1,
                    }
                }

            ]
        )
        console.log(accountDetails[0]);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { accountDetails: accountDetails[0] },
                    "User fetched successfully!"
                )
            )
    }
)

export {
    getUserProfileByUsername
}