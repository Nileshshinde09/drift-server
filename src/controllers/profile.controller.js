import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { Follows } from "../models/follow.model.js"
import mongoose from "mongoose"
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
                    $lookup: {
                        from: "follows",
                        localField: "_id",
                        foreignField: "followeeId",
                        as: "FollwersList"
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
                                    as: 'BookmarkedPosts',
                                    pipeline: [
                                        {
                                            $lookup: {
                                                from: "users",
                                                localField: "ownerId",
                                                foreignField: "_id",
                                                as: "owner",
                                                pipeline:[
                                                    {
                                                        $project:{
                                                            username:1,
                                                            fullName:1,
                                                            avatar:1,
                                                            email:1,
                                                            _id:1,
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            $unwind : "$owner" 
                                        }
                                    ]
                                }
                            },
                            
                        ]
                    }
                },
                {
                    $addFields: {
                        bookmarkCount: { $size: "$BookmarksList" },
                    }
                },
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
        const followersCountAggregate = await Follows.aggregate(
            [
                {
                    $match: {
                        followeeId: new mongoose.Types.ObjectId(accountDetails[0]?._id)
                    }
                },
                {
                    $count: "followersCount"
                }
            ]
        )
        const followeesCountAggregate = await Follows.aggregate(
            [
                {
                    $match: {
                        followerId: new mongoose.Types.ObjectId(accountDetails[0]?._id)
                    }
                },
                {
                    $count: "followeesCount"
                }
            ]
        )
        if (!followersCountAggregate[0]) {
            accountDetails[0].followersCount = 0
        } else {
            accountDetails[0].followersCount = followersCountAggregate[0]?.followersCount || 0
        }
        if (!followeesCountAggregate[0]) {
            accountDetails[0].followeesCount = 0
        } else {
            accountDetails[0].followeesCount = followeesCountAggregate[0]?.followeesCount || 0
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { userProfile: accountDetails[0] },
                    "User fetched successfully!"
                )
            )
    }
)

// const getUserProfileForBookMark = asyncHandler(
//     async (req, res) => {
//         if (!req.user) throw new ApiError(
//             404,
//             "User not found unauthorised access."
//         )
//         const { userId } = req.params
//         if (!userId) throw new ApiError(
//             404,
//             "UserId not found."
//         )
//         const accountDetails = await User.aggregate(
//             [
//                 {
//                     $match: {
//                         username: 
//                     }
//                 },
//                 {
//                     $lookup:{
//                         from:"follows",
//                         localField:"_id",
//                         foreignField:"followeeId",
//                         as:"FollwersList"
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "bookmarks",
//                         localField: "_id",
//                         foreignField: "BookmarkedBy",
//                         as: "BookmarksList",
//                         pipeline: [
//                             {
//                                 $lookup: {
//                                     from: "posts",
//                                     localField: "PostId",
//                                     foreignField: "_id",
//                                     as: 'BookmarkedPosts'
//                                 }
//                             }
//                         ]
//                     }
//                 },
//                 {
//                     $addFields: {
//                         bookmarkCount: { $size: "$BookmarksList" },
//                     }
//                 },
//                 {
//                     $project: {
//                         username: 1,
//                         fullName: 1,
//                         gender: 1,
//                         dob: 1,
//                         avatar: 1,
//                         profileBanner: 1,
//                         bio: 1,
//                         status: 1,
//                         BookmarkedPosts: "$BookmarksList.BookmarkedPosts",
//                         bookmarkCount: 1,
//                     }
//                 }

//             ]
//         )
//         const followersCountAggregate = await Follows.aggregate(
//             [
//                 {
//                     $match: {
//                         followeeId: new mongoose.Types.ObjectId(accountDetails[0]?._id)
//                     }
//                 },
//                 {
//                     $count:"followersCount"
//                 }
//             ]
//         )
//         const followeesCountAggregate = await Follows.aggregate(
//             [
//                 {
//                     $match: {
//                         followerId: new mongoose.Types.ObjectId(accountDetails[0]?._id)
//                     }
//                 },
//                 {
//                     $count:"followeesCount"
//                 }
//             ]
//         )
//         if(!followersCountAggregate[0]){
//             accountDetails[0].followersCount = 0
//         }else{
//             accountDetails[0].followersCount = followersCountAggregate[0]?.followersCount || 0
//         }
//         if(!followeesCountAggregate[0]){
//             accountDetails[0].followeesCount = 0
//         }else{
//             accountDetails[0].followeesCount = followeesCountAggregate[0]?.followeesCount || 0
//         }

//         return res
//             .status(200)
//             .json(
//                 new ApiResponse(
//                     200,
//                     { userProfile: accountDetails[0]  },
//                     "User fetched successfully!"
//                 )
//             )
//     }
// )
export {
    getUserProfileByUsername
}