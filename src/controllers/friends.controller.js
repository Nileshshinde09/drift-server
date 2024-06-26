import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { FriendRequests } from "../models/friendRequest.model.js"
import { Follows } from "../models/follow.model.js"
import mongoose from "mongoose"

const makeAndRetrieveRequestByUserId = asyncHandler(
    async (req, res) => {
        const senderId = req?.user?._id;
        const receiverId = req?.body?.userId;
        try {
            if (!senderId) throw new ApiError(
                404,
                "User not found,Unauthorised Access!"
            )
            if (!receiverId) throw new ApiError(
                404,
                "Receiver Not Found."
            )

            const isRequestExist = await FriendRequests.findOneAndDelete({
                sender: senderId,
                receiver: receiverId
            })

            if (isRequestExist) return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        {
                            retrive: true
                        },
                        "Request retrieve Successfully!"
                    )
                )

            const isFollowing = await Follows.findOne({
                followerId: senderId,
                followeeId: receiverId
            })
            if (!isFollowing) await Follows.create({
                followerId: senderId,
                followeeId: receiverId
            })
            const makeRequest = await FriendRequests.create(
                {
                    sender: senderId,
                    receiver: receiverId
                }
            )
            if (makeRequest) return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        {
                            _id: makeRequest._id,
                            requested: true,
                            followed: true
                        },
                        "Request and Follow Successfully!"
                    )
                )
        } catch (error) {
            throw new ApiError(
                500,
                error.message || "Something went wrong while making friend request!"
            )
        }
    }
)

const getRequestsAndInvitations = asyncHandler(
    async (req, res) => {
        const user = req?.user;
        try {
            if (!user) throw new ApiError(
                404,
                "User not found,Unauthorised request."
            )

            const requesteAggregation = await FriendRequests.aggregate(
                [
                    {
                        $match: {
                            $and: [
                                { sender: new mongoose.Types.ObjectId(user?._id) },
                                { status: false }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "sender",
                            foreignField: "_id",
                            as: "requestedTo",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        username: 1,
                                        avatar: 1,
                                        email: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: "$requestedTo"
                    },
                    {
                        $project: {
                            _id: "$requestedTo._id",
                            username: "$requestedTo.username",
                            avatar: "$requestedTo.avatar",
                            email: "$requestedTo.email"
                        }
                    }
                ]

            )

            const inviteAggregation = await FriendRequests.aggregate(
                [
                    {
                        $match: {
                            $and: [
                                { receiver: new mongoose.Types.ObjectId(user?._id) },
                                { status: false }
                            ]
                        }
                    },
                    {
                        $count: "requestCount"
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "sender",
                            foreignField: "_id",
                            as: "invitedBy",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        username: 1,
                                        avatar: 1,
                                        email: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: "$invitedBy"
                    },
                    {
                        $project: {
                            _id: "$invitedBy._id",
                            username: "$invitedBy.username",
                            avatar: "$invitedBy.avatar",
                            email: "$invitedBy.email"
                        }
                    }

                ]
            )
            if (requesteAggregation && inviteAggregation)
                return res.status(200)
                    .json(
                        new ApiResponse(
                            200,
                            {
                                requests: requesteAggregation,
                                invitations: inviteAggregation
                            },
                            "Request Fetched Successfully!"
                        )
                    )

        } catch (error) {
            throw new ApiError(
                500,
                error.message || "Something went wrong while getting requests!"
            )
        }
    }
)

const respondToInvitations = asyncHandler(
    async (req, res) => {
        const user = req?.user
        const { isAccepted, invitationId } = req?.body;
        try {
            if (!user) throw new ApiError(
                404,
                "User not found"
            )
            if (!invitationId) {
                throw new ApiError(
                    404,
                    "request with empty parameters."
                )
            }
            if (invitationId && !isAccepted) {
                await FriendRequests.findByIdAndDelete(invitationId)
                return res.status(200)
                    .json(
                        new ApiResponse(
                            200,
                            {
                                isAccepted: false
                            },
                            "Invitation Rejected Successfully!"
                        )
                    )
            } else if (invitationId && isAccepted) {
                const response = await FriendRequests.findByIdAndUpdate(invitationId,
                    {
                        status: true
                    }
                )
                if (response?._id) throw new ApiError(
                    404,
                    "Request not found with given Id"
                )
                return res.status(200)
                    .json(
                        new ApiResponse(
                            200,
                            {
                                isAccepted: true
                            },
                            "Invitation Rejected Successfully!"
                        )
                    )
            }


        } catch (error) {
            throw new ApiError(
                500,
                error.message || "Something went wrong while responding friend request!"
            )
        }
    }

)
const getAllFriends = asyncHandler(
    async (req, res) => {
        const user = req?.user;
        if (!user) throw new ApiError(
            404,
            "User not found , Unauthorised Access."
        )
        const friendsAggregation1 = await FriendRequests.aggregate(
            [
                {
                    $match: {
                        sender: new mongoose.Types.ObjectId(user?._id),
                        status: true
                    }
                },
                {
                    $lookup:{
                        from:"users",
                        foreignField:"_id",
                        localField:"receiver",
                        as:"frinds",
                        pipeline:[
                            {
                                $project:{
                                    _id:1,
                                    avatar:1,
                                    username:1,
                                    fullName:1
                                }
                            }
                        ]
                    }
                },


            ]
        )
        const friendsAggregation2 = await FriendRequests.aggregate(
            [
                {
                    $match: {

                        receiver: new mongoose.Types.ObjectId(user?._id),
                        status: true
                    }
                },
                {
                    $lookup:{
                        from:"users",
                        foreignField:"_id",
                        localField:"sender",
                        as:"frinds",
                        pipeline:[
                            {
                                $project:{
                                    _id:1,
                                    avatar:1,
                                    username:1,
                                    fullName:1
                                }
                            }
                        ]
                    }
                },
            ]
        )
        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        ...friendsAggregation1,
                        ...friendsAggregation2
                    },
                    "done"
                )
            )
    }
)
export {
    makeAndRetrieveRequestByUserId,
    getRequestsAndInvitations,
    respondToInvitations,
    getAllFriends
}
