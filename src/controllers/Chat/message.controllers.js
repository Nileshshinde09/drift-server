import mongoose from "mongoose";
import { ChatEventEnum, NotificationMessages,NotificationURLs,NotificationTypesEnum } from "../../constants.js";
import { Chat } from "../../models/chat.model.js"
import { Messages } from "../../models/messages.model.js";
import { emitSocketEvent } from "../../socket/index.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getLocalPath,
  getStaticFilePath,
  removeLocalFile,
} from "../../utils/helper.utils.js";
import { sendNotifications } from "../../services/queue/notification.queue.js";
import { User } from "../../models/user.model.js";

const chatMessageCommonAggregation = () => {
  return [
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "sender",
        as: "sender",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        sender: { $first: "$sender" },
      },
    },
  ];
};

const getAllMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const selectedChat = await Chat.findById(chatId);

  if (!selectedChat) {
    throw new ApiError(404, "Chat does not exist");
  }

  // Only send messages if the logged in user is a part of the chat he is requesting messages of
  if (!selectedChat.participants?.includes(req.user?._id)) {
    throw new ApiError(400, "User is not a part of this chat");
  }

  const messages = await Messages.aggregate([
    {
      $match: {
        chat: new mongoose.Types.ObjectId(chatId),
      },
    },
    ...chatMessageCommonAggregation(),
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, messages || [], "Messages fetched successfully")
    );
});

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;
  if (!content && !req.files?.attachments?.length) {
    throw new ApiError(400, "Message content or attachment is required");
  }

  const selectedChat = await Chat.findById(chatId);

  if (!selectedChat) {
    throw new ApiError(404, "Chat does not exist");
  }

  const messageFiles = [];

  if (req.files && req.files.attachments?.length > 0) {
    req.files.attachments?.map((attachment) => {
      messageFiles.push({
        url: getStaticFilePath(req, attachment.filename),
        localPath: getLocalPath(attachment.filename),
      });
    });
  }

  // Create a new message instance with appropriate metadata
  const message = await Messages.create({
    sender: new mongoose.Types.ObjectId(req.user._id),
    content: content || "",
    chat: new mongoose.Types.ObjectId(chatId),
    attachments: messageFiles,
  });

  // update the chat's last message which could be utilized to show last message in the list item
  const chat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $set: {
        lastMessage: message._id,
      },
    },
    { new: true }
  );

  // structure the message
  const messages = await Messages.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(message._id),
      },
    },
    ...chatMessageCommonAggregation(),
  ]);

  // Store the aggregation result
  const receivedMessage = messages[0];

  if (!receivedMessage) {
    throw new ApiError(500, "Internal server error");
  }

  chat.participants.forEach(async (participantObjectId) => {
    emitSocketEvent(
      req.app.get('io'),
      participantObjectId.toString(),
      ChatEventEnum.MESSAGE_RECEIVED_EVENT,
      receivedMessage
    );
    if (participantObjectId.toString() === req.user._id.toString()) return;
    const participant_username = await User.findById(participantObjectId)
    if(chat.isGroupChat){
      sendNotifications(
        req.user._id.toString(),
        NotificationMessages.INDIVIDUAL_CHAT_MESSAGE+" "+participant_username?.username,
        content?content:"",
        NotificationURLs.GROUP_CHAT_INITIALIZATION_URL+chat._id.toString()+'/false',
        NotificationTypesEnum.INDIVIDUAL,
        participantObjectId.toString()
      )
    }else{
      sendNotifications(
        req.user._id.toString(),
        NotificationMessages.INDIVIDUAL_CHAT_MESSAGE+" "+participant_username?.username,
        content?content:"",
        NotificationURLs.CHAT_INITIALIZATION_URL + req?.user?.id.toString(),
        NotificationTypesEnum.INDIVIDUAL,
        participantObjectId.toString()
      )
    }
  });

  return res
    .status(201)
    .json(new ApiResponse(201, receivedMessage, "Message saved successfully"));
});

const deleteMessage = asyncHandler(async (req, res) => {

  const { chatId, messageId } = req.params;

  const chat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    participants: req.user?._id,
  });

  if (!chat) {
    throw new ApiError(404, "Chat does not exist");
  }

  const message = await Messages.findOne({
    _id: new mongoose.Types.ObjectId(messageId),
  });

  if (!message) {
    throw new ApiError(404, "Message does not exist");
  }

  if (message.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not the authorised to delete the message, you are not the sender"
    );
  }
  if (message.attachments.length > 0) {
    message.attachments.map((asset) => {
      removeLocalFile(asset.localPath);
    });
  }
  await Messages.deleteOne({
    _id: new mongoose.Types.ObjectId(messageId),
  });

  if (chat.lastMessage.toString() === message._id.toString()) {
    const lastMessage = await Messages.findOne(
      { chat: chatId },
      {},
      { sort: { createdAt: -1 } }
    );

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: lastMessage ? lastMessage?._id : null,
    });
  }
  chat.participants.forEach((participantObjectId) => {
    if (participantObjectId.toString() === req.user._id.toString()) return;
    emitSocketEvent(
      req.app.get("io"),
      participantObjectId.toString(),
      ChatEventEnum.MESSAGE_DELETE_EVENT,
      message
    );
  });

  return res
    .status(200)
    .json(new ApiResponse(200, message, "Message deleted successfully"));
});

export { getAllMessages, sendMessage, deleteMessage };
