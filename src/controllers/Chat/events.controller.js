import { ChatEventEnum } from "../../constants.js";
import { Chat } from "../../models/chat.model.js"
import { emitSocketEvent } from "../../socket/index.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../models/user.model.js";

const TypingEvent = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const selectedChat = await Chat.findById(chatId);
    if (!selectedChat) {
        throw new ApiError(404, "Chat does not exist");
    }
    const chat = await Chat.findById(chatId);
    const user = await User.findById(req.user._id);
    chat.participants.forEach(async (participantObjectId) => {
        if (participantObjectId.toString() === req.user._id.toString()) return;
        emitSocketEvent(
            req.app.get('io'),
            participantObjectId.toString(),
            ChatEventEnum.TYPING_EVENT,
            user?.username+' '+"typing.." 
        );
        // if (participantObjectId.toString() === req.user._id.toString()) return;
        // const participant_username = await User.findById(participantObjectId)
        // sendNotifications(
        //   req.user._id.toString(),
        //   NotificationMessages.INDIVIDUAL_CHAT_MESSAGE+" "+participant_username.username,
        //   content?content:"",
        //   NotificationURLs.CHAT_INITIALIZATION_URL + participantObjectId.toString(),
        //   NotificationTypesEnum.INDIVIDUAL,
        //   participantObjectId.toString()
        // )
    });

    return res
        .status(201)
        .json(new ApiResponse(201, {}, "Typing event submitted sucessfully!"));
});

const StopTypingEvent = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const selectedChat = await Chat.findById(chatId);
    if (!selectedChat) {
        throw new ApiError(404, "Chat does not exist");
    }
    const chat = await Chat.findById(chatId);
    chat.participants.forEach(async (participantObjectId) => {
        if (participantObjectId.toString() === req.user._id.toString()) return;
        emitSocketEvent(
            req.app.get('io'),
            participantObjectId.toString(),
            ChatEventEnum.STOP_TYPING_EVENT,
            ""
        );
        // if (participantObjectId.toString() === req.user._id.toString()) return;
        // const participant_username = await User.findById(participantObjectId)
        // sendNotifications(
        //   req.user._id.toString(),
        //   NotificationMessages.INDIVIDUAL_CHAT_MESSAGE+" "+participant_username.username,
        //   content?content:"",
        //   NotificationURLs.CHAT_INITIALIZATION_URL + participantObjectId.toString(),
        //   NotificationTypesEnum.INDIVIDUAL,
        //   participantObjectId.toString()
        // )
    });

    return res
        .status(201)
        .json(new ApiResponse(201, {}, "Typing stop event submitted sucessfully!"));
});


const userLiveEvent=asyncHandler(
    async(req,res)=>{
        
    }
)

export { TypingEvent,StopTypingEvent,userLiveEvent };
