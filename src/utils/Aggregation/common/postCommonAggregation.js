import mongoose from "mongoose"

const PostCommonAggregration=(userId)=> {
    return[
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "postId",
                as: "comments"
            }
        }, {
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
        }
        , {
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
            $lookup: {
                from: "users",
                localField: "ownerId",
                foreignField: "_id",
                as: "profile",
                pipeline: [
                    {
                        $project: {
                            avatar: 1,
                            username: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                creator: { $first: "$profile" },
                likes: { $size: "$likes" },
                comments: { $size: "$comments" },
            }
        }, {
            $project: {
                profile: 0,
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
        }
    ]
}
export {
    PostCommonAggregration
}