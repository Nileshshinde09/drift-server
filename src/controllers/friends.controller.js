import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { FriendRequests } from "../models/friendRequest.model.js"
import { Follows } from "../models/follow.model.js"
import mongoose from "mongoose"
import { sendNotifications } from "../services/queue/notification.queue.js"
import { NotificationURLs, NotificationTypesEnum, NotificationMessages } from "../constants.js"
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
            if (makeRequest) sendNotifications(
                req.user._id.toString(),
                NotificationMessages.FRIEND_REQUEST_MESSAGE,
                "",
                NotificationURLs.MAKE_REQUEST_URL + req.user.username?.toString(),
                NotificationTypesEnum.INDIVIDUAL,
                receiverId?.toString(),
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
                "User not found, unauthorized request."
            );

            // Aggregation for friend requests sent by the user
            // const requestAggregation = await FriendRequests.aggregate([
            //     {
            //         $match: {
            //             sender: new mongoose.Types.ObjectId(user?._id),
            //             status: false
            //         }
            //     },
            //     {
            //         $lookup: {
            //             from: "users",
            //             localField: "receiver",
            //             foreignField: "_id",
            //             as: "requestedTo",
            //             pipeline: [
            //                 {
            //                     $project: {
            //                         _id: 1,
            //                         username: 1,
            //                         avatar: 1,
            //                         email: 1,
            //                         createdAt: 1,
            //                         fullName: 1
            //                     }
            //                 }
            //             ]
            //         }
            //     },
            //     {
            //         $unwind: "$requestedTo"
            //     },
            //     {
            //         $project: {
            //             _id: "$requestedTo._id",
            //             username: "$requestedTo.username",
            //             avatar: "$requestedTo.avatar",
            //             email: "$requestedTo.email",
            //             createdAt: "$requestedTo.createdAt",
            //             fullName: "$requestedTo.fullName"
            //         }
            //     }
            // ]);

            // Aggregation for friend invitations received by the user
            const requestAggregation = await FriendRequests.aggregate([
                {
                    $match: {
                        receiver: new mongoose.Types.ObjectId(user?._id),
                        status: false
                    }
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
                                    email: 1,
                                    createdAt: 1,
                                    fullName: 1
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
                        email: "$invitedBy.email",
                        createdAt: "$invitedBy.createdAt",
                        fullName: "$invitedBy.fullName",
                        requestId: "$$ROOT._id"
                    }
                }
            ]);

            if (requestAggregation) {
                return res.status(200).json(
                    new ApiResponse(
                        200,
                        {
                            requests: requestAggregation
                        },
                        "Requests fetched successfully!"
                    )
                );
            }

        } catch (error) {
            throw new ApiError(
                500,
                error.message || "Something went wrong while getting requests!"
            );
        }
    }
);

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
                const response = await FriendRequests.findByIdAndDelete(invitationId)
                if (response) sendNotifications(
                    req.user._id.toString(),
                    NotificationMessages.FRIEND_REQUEST_REJECTED_MESSAGE,
                    "",
                    NotificationURLs.MAKE_REQUEST_URL + req.user.username?.toString(),
                    NotificationTypesEnum.INDIVIDUAL,
                    response.sender?.toString(),
                )
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
                if (response) sendNotifications(
                    req.user._id.toString(),
                    NotificationMessages.FRIEND_REQUEST_ACCEPTED_MESSAGE,
                    "",
                    NotificationURLs.MAKE_REQUEST_URL + req.user.username?.toString(),
                    NotificationTypesEnum.INDIVIDUAL,
                    response.sender?.toString(),

                )

                return res.status(200)
                    .json(
                        new ApiResponse(
                            200,
                            {
                                isAccepted: true
                            },
                            "Invitation Accepted Successfully!"
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
                    $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "receiver",
                        as: "friend",
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    avatar: 1,
                                    username: 1,
                                    fullName: 1,
                                    createdAt: 1
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
                    $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "sender",
                        as: "friend",
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    avatar: 1,
                                    username: 1,
                                    fullName: 1,
                                    createdAt: 1

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
                    [
                        ...friendsAggregation1,
                        ...friendsAggregation2
                    ],
                    "done"
                )
            )
    }
)

const checkIsFriends = asyncHandler(
    async (req, res) => {
        const user = req?.user;
        const {remote_id} = req.params;
        if (!user) throw new ApiError(
            404,
            "User not found , Unauthorised Access."
        )
        if (!remote_id) throw new ApiError(
            404,
            "remote Id user not found."
        )
        const response = await FriendRequests.aggregate(
            [
                {
                    $match: {
                        $or: [
                            {
                                receiver: new mongoose.Types.ObjectId(user?._id),
                                sender: new mongoose.Types.ObjectId(remote_id),
                                status: true
                            },
                            {
                        
                                sender: new mongoose.Types.ObjectId(user?._id),
                                receiver: new mongoose.Types.ObjectId(remote_id),
                                status: true
                            
                            }
                        ]
                    }
                }
            ]
        )
        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        ...response[0]
                    },
                    "done"
                )
            )
    }
)

const removeFriendFromFriendList = asyncHandler(
    async (req, res) => {
        const user = req?.user;
        const {requestId} = req.params;
        
        if (!user) throw new ApiError(
            404,
            "User not found , Unauthorised Access."
        )
        if (!requestId) throw new ApiError(
            404,
            "request Id not found."
        )
        const response = await FriendRequests.findByIdAndDelete(requestId)
        if(!response) throw new ApiError(
            500,
            "something went wrong while removing friend from friend list."
        )
        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        isRemoved:true
                    },
                    "done"
                )
            )
    }
)
export {
    checkIsFriends,
    removeFriendFromFriendList,
    makeAndRetrieveRequestByUserId,
    getRequestsAndInvitations,
    respondToInvitations,
    getAllFriends
}
