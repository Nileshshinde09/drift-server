import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { Follows } from "../models/follow.model.js"
import mongoose from "mongoose"
const followOrUnfollowByUsername = asyncHandler(
    async (req, res) => {
        const follower = req.user
        const username = req.params?.username;
        try {
            if (!username) throw new ApiError(
                404,
                "followee not found"
            )
            if (!follower) throw new ApiError(
                404,
                "User not found , Unauthorized request"
            )
            if (username === follower?.username) throw new ApiError(
                409,
                "follow conflict , You cant follow yourself"
            )
            const followee = await User.findOne({
                username
            })

            if (!followee) throw new ApiError(
                404,
                "Followee not found in database"
            )
            const isFollowed = await Follows.findOne({
                followerId: follower?._id,
                followeeId: followee?._id
            })
            if (isFollowed) {
                await Follows.findByIdAndDelete({
                    _id: isFollowed?._id
                })
                return res.
                    status(200)
                    .json(
                        new ApiResponse(
                            200,
                            {
                                followed: false,
                            },
                            "Unfollowed Successfully"

                        )
                    )
            } else {
                const followedResponse = await Follows.create({
                    followerId: follower,
                    followeeId: followee?._id
                })
                if (!followedResponse) throw new ApiError(
                    500,
                    "Something went wrong while performing database operation"
                )
                return res.
                    status(200)
                    .json(
                        new ApiResponse(
                            200,
                            {
                                followed: true,
                            },
                            "Followed Successfully"

                        )
                    )
            }

        } catch (error) {
            throw new ApiError(
                500,
                error?.message || "Something went wrong while performing follow operations."
            )
        }
    }
)

const getFollowersByUsername = asyncHandler(
    async (req, res) => {
        const username = req.params?.username
        if (!req.user) throw new ApiError(
            404,
            "User not found ,Unauthorised Access"
        )
        const { page = 1, limit = 10 } = req.query;
        const userAggregation = await User.aggregate(
            [
                {
                    $match: {
                        username: username.toLowerCase()
                    }
                },
                {
                    $project: {
                        username: 1,
                        email: 1,
                        gender: 1,
                        dob: 1,
                        avatar: 1,
                        profileBanner: 1,
                        bio: 1,
                        status: 1,
                        emailVerified: 1
                    }
                }
            ]
        )
        const user = userAggregation[0]
        if (!user) throw new ApiError(
            404,
            "User not found"
        )
        const userId = user?._id
        const followersAggregate = await Follows.aggregate(
            [
                {
                    $match: {
                        followeeId: new mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "followerId",
                        foreignField: "_id",
                        as: "follower",
                        pipeline: [
                            {
                                $project: {
                                    username: 1,
                                    email: 1,
                                    gender: 1,
                                    dob: 1,
                                    avatar: 1,
                                    profileBanner: 1,
                                    bio: 1,
                                    status: 1,
                                    emailVerified: 1
                                },

                            },
                            {
                                $lookup: {
                                    from: "follows",
                                    localField: "_id",
                                    foreignField: "followeeId",
                                    as: "isFollowing",
                                    pipeline: [
                                        {
                                            $match:
                                            {
                                                followerId: new mongoose.Types.ObjectId(req?.user?._id)
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $addFields: {
                                    isFollowing: {
                                        $cond: {
                                            if: {
                                                $gte: [
                                                    {
                                                        $size: "$isFollowing",
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
                                $project: {
                                    username: 1,
                                    email: 1,
                                    gender: 1,
                                    dob: 1,
                                    avatar: 1,
                                    profileBanner: 1,
                                    bio: 1,
                                    status: 1,
                                    emailVerified: 1,
                                    isFollowing: 1

                                }
                            }

                        ]
                    },
                },
                {
                    $addFields: {
                        follower: { $first: "$follower" },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        follower: 1,
                    },
                },
                {
                    $replaceRoot: {
                        newRoot: "$follower",
                    },
                },


            ]
        )
        // const followersList = await Follows.aggregatePaginate(
        //     followersAggregate,
        //     {
        //         page: Math.max(page, 1),
        //         limit: Math.max(limit, 1),
        //         pagination: true,
        //         customLabels: {
        //             pagingCounter: "serialNumberStartFrom",
        //             totalDocs: "totalFollowers",
        //             docs: "followers",
        //         },
        //     }
        // )
        return res.
            status(200)
            .json(
                new ApiResponse(
                    200,
                    { user, followers: followersAggregate },
                    "followers fetched successfully"
                )
            )
    }
)
const getFolloweesByUsername = asyncHandler(
    async (req, res) => {
        if (!req.user) throw new ApiError(
            404,
            "User not found ,Unauthorised Access"
        )
        const username = req.params?.username
        if (!username) throw new ApiError(
            404,
            "Username not found."
        )
        const { page = 1, limit = 10 } = req.query;
        const userAggregation = await User.aggregate(
            [
                {
                    $match: {
                        username: username.toLowerCase()
                    }
                },
                {
                    $project: {
                        username: 1,
                        email: 1,
                        gender: 1,
                        dob: 1,
                        avatar: 1,
                        profileBanner: 1,
                        bio: 1,
                        status: 1,
                        emailVerified: 1
                    }
                }
            ]
        )
        const user = userAggregation[0]
        if (!user) throw new ApiError(
            404,
            "User not found"
        )
        const userId = user?._id
        const followeesAggregate = await Follows.aggregate(
            [
                {
                    $match: {
                        followerId: new mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "followerId",
                        foreignField: "_id",
                        as: "followee",
                        pipeline: [
                            {
                                $project: {
                                    username: 1,
                                    email: 1,
                                    gender: 1,
                                    dob: 1,
                                    avatar: 1,
                                    profileBanner: 1,
                                    bio: 1,
                                    status: 1,
                                    emailVerified: 1
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
                                                followeeId: new mongoose.Types.ObjectId(req?.user?._id)
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
                                $project: {
                                    username: 1,
                                    email: 1,
                                    gender: 1,
                                    dob: 1,
                                    avatar: 1,
                                    profileBanner: 1,
                                    bio: 1,
                                    status: 1,
                                    emailVerified: 1,
                                    isFollower: 1

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
                        _id: 0,
                        followee: 1,
                    },
                },
                {
                    $replaceRoot: {
                        newRoot: "$followee",
                    },
                },
            ]
        )
        // const followeesList = await Follows.aggregatePaginate(
        //     followeesAggregate,
        //     {
        //         page: Math.max(page, 1),
        //         limit: Math.max(limit, 1),
        //         pagination: true,
        //         customLabels: {
        //             pagingCounter: "serialNumberStartFrom",
        //             totalDocs: "totalFollowers",
        //             docs: "followers",
        //         },
        //     }
        // )

        return res.
            status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        user,
                        followees: followeesAggregate
                    },
                    "followees fetched successfully"
                )
            )
    }
)
const isFollowed = asyncHandler(

    async (req, res) => {
        try {
            if (!req.user) throw new ApiError(
                404,
                "User not found. Unauthorised request."
            )
            const username = req.params?.username
            console.log(username);
            if (!username) throw new ApiError(
                404,
                "Username not found."
            )

            const followee = await User.findOne({ username })
            if (followee?._id){

                const response = await Follows.findOne(
                    {
                        followerId: req?.user?._id,
                        followeeId: followee?._id
                    }
                )
                if(response?._id){
                    return res.
                    status(200)
                    .json(
                        new ApiResponse(
                            200,
                            {
                                followed:true
                            }
                        )
                    )                    
                } 
            }
            return res.
            status(200)
            .json(
                new ApiResponse(
                    401,
                    {
                        followed:false
                    }
                )
            )  
        } catch (error) {
            throw new ApiError(
                500,
                error.message || "something went wrong while getting user follow state."
            )
        }
    }
)
export {
    isFollowed,
    followOrUnfollowByUsername,
    getFollowersByUsername,
    getFolloweesByUsername
}