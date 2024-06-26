import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Call } from "../models/call.model.js"
import { sendNotifications } from "../services/queue/notification.queue.js"
import { FriendRequests } from "../models/friendRequest.model.js"
import { CallTypesEnum, NotificationTypesEnum, NotificationMessages, NotificationURLs } from "../constants.js"
import { emitSocketEvent } from "../socket/index.js"
import mongoose from "mongoose"
const ansToCall = asyncHandler(
    async (req, res) => {
        const callerId = req.user?._id;
        const receiverId = req.body?.receiverId;
        const ans = req.body?.ans;
        try {
            if (!callerId) throw new ApiError(
                404,
                "User not found,Unauthorised request."
            )
            if (!receiverId) throw new ApiError(
                404,
                "Receiver Id not found."
            )
            if (!ans) throw new ApiError(
                404,
                "answer 🫂 not found."
            )
            console.log("ans");
            const isFriend = await FriendRequests.aggregate(
                [
                    {
                        $match: {
                            $or: [
                                {
                                    receiver: new mongoose.Types.ObjectId(receiverId),
                                    sender: new mongoose.Types.ObjectId(callerId),
                                    status: true
                                },
                                {
                                    receiver: new mongoose.Types.ObjectId(callerId),
                                    sender: new mongoose.Types.ObjectId(receiverId),
                                    status: true
                                },
                            ]
                        },
                        
                    },
                ]
            )
            if (!isFriend) throw new ApiError(
                405,
                "Users must be friends to make call."
            )
            
            emitSocketEvent(
                req.app.get('io'),
                receiverId,
                'ans-to-call',
                {
                    userId:callerId,
                    payload: ans,
                    message: NotificationMessages.VIDEO_CALL_NOTIFICATION_MESSAGE,
                    url: NotificationURLs.VIDEO_CALL_NOTIFICATION_URL,
                    type: NotificationTypesEnum.INDIVIDUAL,
                }
            )
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        {},
                        "ans send successfully!"
                    )
                )

        } catch (error) {
            console.log(error.message || "Something went wrong while making call.");
            throw new ApiError(
                500,
                "Something went wrong while making call."
            )
        }

    }
)
const initializeCall = asyncHandler(
    async (req, res) => {
        const callerId = req.user?._id;
        const receiverId = req.body?.receiverId;
        const ice_Candidate = req.body?.ice_Candidate;
        console.log(ice_Candidate);
        try {
            if (!callerId) throw new ApiError(
                404,
                "User not found,Unauthorised request."
            )
            if (!receiverId) throw new ApiError(
                404,
                "Receiver Id not found."
            )
            if (!ice_Candidate) throw new ApiError(
                404,
                "ice candidate 🫂 not found."
            )
            
            const isFriend = await FriendRequests.aggregate(
                [
                    {
                        $match: {
                            $or: [
                                {
                                    receiver: new mongoose.Types.ObjectId(receiverId),
                                    sender: new mongoose.Types.ObjectId(callerId),
                                    status: true
                                },
                                {
                                    receiver: new mongoose.Types.ObjectId(callerId),
                                    sender: new mongoose.Types.ObjectId(receiverId),
                                    status: true
                                },
                            ]
                        },
                        
                    },
                ]
            )
            if (!isFriend) throw new ApiError(
                405,
                "Users must be friends to make call."
            )
            
            emitSocketEvent(
                req.app.get('io'),
                receiverId,
                'initialize-call-ice-candidate',
                {
                    userId:callerId,
                    payload: ice_Candidate,
                    message: NotificationMessages.VIDEO_CALL_NOTIFICATION_MESSAGE,
                    url: NotificationURLs.VIDEO_CALL_NOTIFICATION_URL,
                    type: NotificationTypesEnum.INDIVIDUAL,
                }
            )
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        {},
                        "ice_Candidate send successfully!"
                    )
                )

        } catch (error) {
            console.log(error.message || "Something went wrong while making call.");
            throw new ApiError(
                500,
                "Something went wrong while making call."
            )
        }

    }
)
const makeCallRequest = asyncHandler(
    async (req, res) => {
        const callerId = req.user?._id;
        const receiverId = req.body?.receiverId;
        const created_Offer = req.body?.created_Offer;
        try {
            if (!callerId) throw new ApiError(
                404,
                "User not found,Unauthorised request."
            )
            if (!receiverId) throw new ApiError(
                404,
                "Receiver Id not found."
            )
            if (!created_Offer) throw new ApiError(
                404,
                "Offer 📃 not found."
            )

            const isFriend = await FriendRequests.aggregate(
                [
                    {
                        $match: {
                            $or: [
                                {
                                    receiver: new mongoose.Types.ObjectId(receiverId),
                                    sender: new mongoose.Types.ObjectId(callerId),
                                    status: true
                                },
                                {
                                    receiver: new mongoose.Types.ObjectId(callerId),
                                    sender: new mongoose.Types.ObjectId(receiverId),
                                    status: true
                                },
                            ]
                        },

                    },
                ]
            )
            if (!isFriend) throw new ApiError(
                405,
                "Users must be friends to make call."
            )
            await Call.create(
                {
                    caller: callerId,
                    receiver: receiverId,
                    callType: CallTypesEnum.VIDEO, // only for testing....  
                }
            )
            emitSocketEvent(
                req.app.get('io'),
                receiverId,
                'make-call-notification',
                {
                    callerId,
                    payload: created_Offer,
                    message: NotificationMessages.VIDEO_CALL_NOTIFICATION_MESSAGE,
                    url: NotificationURLs.VIDEO_CALL_NOTIFICATION_URL,
                    type: NotificationTypesEnum.INDIVIDUAL,
                }
            )
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        {},
                        "Call request send successfully!"
                    )
                )

        } catch (error) {
            console.log(error.message || "Something went wrong while making call.");
            throw new ApiError(
                500,
                "Something went wrong while making call."
            )
        }

    }
)

const acceptCallReqest = asyncHandler(
    async (req, res) => {
        const callerId = req.user?._id;
        const receiverId = req.query?.receiverId;
        const ans = req.body?.ans;
        try {
            if (!callerId) throw new ApiError(
                404,
                "User not found,Unauthorised request."
            )
            if (!receiverId) throw new ApiError(
                404,
                "Receiver Id not found."
            )
            if (!ans) throw new ApiError(
                404,
                "Answer 📃 not found."
            )
            const isFriend = await FriendRequests.aggregate(
                [
                    {
                        $match: {
                            $or: [
                                {
                                    receiver: new mongoose.Types.ObjectId(receiverId),
                                    sender: new mongoose.Types.ObjectId(callerId),
                                    status: true
                                },
                                {
                                    receiver: new mongoose.Types.ObjectId(callerId),
                                    sender: new mongoose.Types.ObjectId(receiverId),
                                    status: true
                                },
                            ]
                        },

                    },
                ]
            )
            if (!isFriend) throw new ApiError(
                405,
                "Users must be friends to make call."
            )
            await Call.updateOne(
                {
                    isAccepted: true
                }
            )
            emitSocketEvent(
                req.app.get('io'),
                callerId,
                'accept-call-notification',
                {
                    userId,
                    payload: ans,
                    message: NotificationMessages.VIDEO_CALL_NOTIFICATION_MESSAGE,
                    url: NotificationURLs.VIDEO_CALL_NOTIFICATION_URL,
                    type: NotificationTypesEnum.INDIVIDUAL,
                }
            )
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        {},
                        "Call request send successfully!"
                    )
                )


        } catch (error) {
            console.log(error.message || "Something went wrong while making call.");
            throw new ApiError(
                500,
                "Something went wrong while making call."
            )
        }

    }
)

export {
    makeCallRequest,
    acceptCallReqest,
    ansToCall,
    initializeCall
}