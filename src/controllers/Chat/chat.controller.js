import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { removeLocalFile } from "../../utils/helper.utils.js"
import {User} from "../../models/user.model.js"
import { ChatEventEnum } from "../../constants.js";
import {Chat} from "../../models/chat.model.js"
import { Messages as ChatMessage } from "../../models/messages.model.js";
import {emitSocketEvent} from "../../socket/index.js"
import { FriendRequests } from "../../models/friendRequest.model.js";

const chatCommonAggregation = () => {
  return [
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "participants",
        as: "participants",
        pipeline: [
          {
            $project: {
              password: 0,
              refreshToken: 0,
              forgotPasswordToken: 0,
              forgotPasswordExpiry: 0,
              emailVerificationToken: 0,
              emailVerificationExpiry: 0,
            },
          },
        ],
      },
    },
    {

      $lookup: {
        from: "chatmessages",
        foreignField: "_id",
        localField: "lastMessage",
        as: "lastMessage",
        pipeline: [
          {
            // get details of the sender
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
        ],
      },
    },
    {
      $addFields: {
        lastMessage: { $first: "$lastMessage" },
      },
    },
  ];
};


const deleteCascadeChatMessages = async (chatId) => {
  const messages = await ChatMessage.find({
    chat: new mongoose.Types.ObjectId(chatId),
  });

  let attachments = [];

  attachments = attachments.concat(
    ...messages.map((message) => {
      return message.attachments;
    })
  );

  attachments.forEach((attachment) => {
    removeLocalFile(attachment.localPath);
  });

  await ChatMessage.deleteMany({
    chat: new mongoose.Types.ObjectId(chatId),
  });
};

const searchAvailableFriends = asyncHandler(async (req, res) => {
  const friends = await FriendRequests.aggregate(
    [
        {
            $match: {
                $or: [
                    {
                        sender: new mongoose.Types.ObjectId(req.user._id),
                        status: true
                    },
                    {
                        receiver: new mongoose.Types.ObjectId(req.user._id),
                        status: true
                    },
                ]
            },
        }
    ]
)
if (!friends) throw new ApiError(
    405,
    "Users must be friends to chat."
)
  
  // const friends = await FriendRequests.aggregate([
  //   {
  //     $match: {
  //       _id: {
  //         $ne: req.user._id, // avoid logged in user
  //       },
  //     },
  //   },
  //   {
  //     $project: {
  //       avatar: 1,
  //       username: 1,
  //       email: 1,
  //     },
  //   },
  // ]);

  return res
    .status(200)
    .json(new ApiResponse(200, friends, "Friends fetched successfully"));
});

const createOrGetAOneOnOneChat = asyncHandler(async (req, res) => {
  const { receiverId } = req.params;

  // Check if it's a valid receiver
  const receiver = await User.findById(receiverId);

  if (!receiver) {
    throw new ApiError(404, "Receiver does not exist");
  }

  // check if receiver is not the user who is requesting a chat
  if (receiver._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot chat with yourself");
  }

  const chat = await Chat.aggregate([
    {
      $match: {
        isGroupChat: false, 
        $and: [
          {
            participants: { $elemMatch: { $eq: req.user._id } },
          },
          {
            participants: {
              $elemMatch: { $eq: new mongoose.Types.ObjectId(receiverId) },
            },
          },
        ],
      },
    },
    ...chatCommonAggregation(),
  ]);

  if (chat.length) {
    // if we find the chat that means user already has created a chat
    return res
      .status(200)
      .json(new ApiResponse(200, chat[0], "Chat retrieved successfully"));
  }

  // if not we need to create a new one on one chat
  const newChatInstance = await Chat.create({
    name: "One on one chat",
    participants: [req.user._id, new mongoose.Types.ObjectId(receiverId)], // add receiver and logged in user as participants
    admin: req.user._id,
  });

  // structure the chat as per the common aggregation to keep the consistency
  const createdChat = await Chat.aggregate([
    {
      $match: {
        _id: newChatInstance._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = createdChat[0]; // store the aggregation result

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  // logic to emit socket event about the new chat added to the participants
  payload?.participants?.forEach((participant) => {
    if (participant._id.toString() === req.user._id.toString()) return; // don't emit the event for the logged in use as he is the one who is initiating the chat

    // emit event to other participants with new chat as a payload
    emitSocketEvent(
      req,
      participant._id?.toString(),
      ChatEventEnum.NEW_CHAT_EVENT,
      payload
    );
  });

  return res
    .status(201)
    .json(new ApiResponse(201, payload, "Chat retrieved successfully"));
});

const createAGroupChat = asyncHandler(async (req, res) => {
  const { name, participants,isAnoGroupChat=false,topic } = req.body;
  if(!topic) throw new ApiError(404,"Topic not found!")
  // Check if user is not sending himself as a participant. This will be done manually
  if (participants.includes(req.user._id.toString())) {
    throw new ApiError(
      400,
      "Participants array should not contain the group creator"
    );
  }

  const members = [...new Set([...participants, req.user._id.toString()])]; // check for duplicates

  if (members.length < 2) {
    // check after removing the duplicate
    // We want group chat to have minimum 3 members including admin
    throw new ApiError(
      400,
      "Seems like you have passed duplicate participants."
    );
  }

  // Create a group chat with provided members
  const groupChat = await Chat.create({
    name,
    isGroupChat: true,
    topic,
    isAnoGroupChat,
    participants: members,
    admin: req.user._id,
  });

  // structure the chat
  const chat = await Chat.aggregate([
    {
      $match: {
        _id: groupChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = chat[0];

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  // logic to emit socket event about the new group chat added to the participants
  payload?.participants?.forEach((participant) => {
    if (participant._id.toString() === req.user._id.toString()) return; // don't emit the event for the logged in use as he is the one who is initiating the chat
    // emit event to other participants with new chat as a payload
    emitSocketEvent(
      req.app.get("io"),
      participant._id?.toString(),
      ChatEventEnum.NEW_CHAT_EVENT,
      payload
    );
  });

  return res
    .status(201)
    .json(new ApiResponse(201, payload, "Group chat created successfully"));
});

const getGroupChatDetails = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const groupChat = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
        isGroupChat: true,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const chat = groupChat[0];

  if (!chat) {
    throw new ApiError(404, "Group chat does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, chat, "Group chat fetched successfully"));
});

const renameGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { name } = req.body;
  // check for chat existence
  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isGroupChat: true,
  });

  if (!groupChat) {
    throw new ApiError(404, "Group chat does not exist");
  }

  // only admin can change the name
  if (groupChat.admin?.toString() !== req.user._id?.toString()) {
    throw new ApiError(404, "You are not an admin");
  }

  const updatedGroupChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $set: {
        name,
      },
    },
    { new: true }
  );

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: updatedGroupChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = chat[0];

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  // logic to emit socket event about the updated chat name to the participants
  payload?.participants?.forEach((participant) => {
    // emit event to all the participants with updated chat as a payload
    emitSocketEvent(
      req.app.get("io"),
      participant._id?.toString(),
      ChatEventEnum.UPDATE_GROUP_NAME_EVENT,
      payload
    );
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, chat[0], "Group chat name updated successfully")
    );
});

const deleteGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  // check for the group chat existence
  const groupChat = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
        isGroupChat: true,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const chat = groupChat[0];

  if (!chat) {
    throw new ApiError(404, "Group chat does not exist");
  }

  // check if the user who is deleting is the group admin
  if (chat.admin?.toString() !== req.user._id?.toString()) {
    throw new ApiError(404, "Only admin can delete the group");
  }

  await Chat.findByIdAndDelete(chatId); // delete the chat

  await deleteCascadeChatMessages(chatId); // remove all messages and attachments associated with the chat

  // logic to emit socket event about the group chat deleted to the participants
  chat?.participants?.forEach((participant) => {
    if (participant._id.toString() === req.user._id.toString()) return; // don't emit the event for the logged in use as he is the one who is deleting
    // emit event to other participants with left chat as a payload
    emitSocketEvent(
      req,
      participant._id?.toString(),
      ChatEventEnum.LEAVE_CHAT_EVENT,
      chat
    );
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Group chat deleted successfully"));
});

const deleteOneOnOneChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  // check for chat existence
  const chat = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = chat[0];

  if (!payload) {
    throw new ApiError(404, "Chat does not exist");
  }

  await Chat.findByIdAndDelete(chatId); // delete the chat even if user is not admin because it's a personal chat

  await deleteCascadeChatMessages(chatId); // delete all the messages and attachments associated with the chat

  const otherParticipant = payload?.participants?.find(
    (participant) => participant?._id.toString() !== req.user._id.toString() // get the other participant in chat for socket
  );

  // emit event to other participant with left chat as a payload
  emitSocketEvent(
    req,
    otherParticipant._id?.toString(),
    ChatEventEnum.LEAVE_CHAT_EVENT,
    payload
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Chat deleted successfully"));
});

const leaveGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  // check if chat is a group
  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isGroupChat: true,
  });

  if (!groupChat) {
    throw new ApiError(404, "Group chat does not exist");
  }

  const existingParticipants = groupChat.participants;

  // check if the participant that is leaving the group, is part of the group
  if (!existingParticipants?.includes(req.user?._id)) {
    throw new ApiError(400, "You are not a part of this group chat");
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: {
        participants: req.user?._id, // leave the group
      },
    },
    { new: true }
  );

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: updatedChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = chat[0];

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, payload, "Left a group successfully"));
});

const addNewParticipantInGroupChat = asyncHandler(async (req, res) => {
  const { chatId, participantId } = req.params;

  // check if chat is a group
  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isGroupChat: true,
  });

  if (!groupChat) {
    throw new ApiError(404, "Group chat does not exist");
  }

  // check if user who is adding is a group admin
  if (groupChat.admin?.toString() !== req.user._id?.toString()) {
    throw new ApiError(404, "You are not an admin");
  }

  const existingParticipants = groupChat.participants;

  // check if the participant that is being added in a part of the group
  if (existingParticipants?.includes(participantId)) {
    throw new ApiError(409, "Participant already in a group chat");
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: {
        participants: participantId, // add new participant id
      },
    },
    { new: true }
  );

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: updatedChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = chat[0];

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  // emit new chat event to the added participant
  emitSocketEvent(req, participantId, ChatEventEnum.NEW_CHAT_EVENT, payload);

  return res
    .status(200)
    .json(new ApiResponse(200, payload, "Participant added successfully"));
});

const removeParticipantFromGroupChat = asyncHandler(async (req, res) => {
  const { chatId, participantId } = req.params;
  // check if chat is a group
  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isGroupChat: true,
  });
  if (!groupChat) {
    throw new ApiError(404, "Group chat does not exist");
  }
  // check if user who is deleting is a group admin
  if (groupChat.admin?.toString() !== req.user._id?.toString()) {
    throw new ApiError(404, "You are not an admin");
  }
  const existingParticipants = groupChat.participants;
  // check if the participant that is being removed in a part of the group
  if (!existingParticipants?.includes(participantId)) {
    throw new ApiError(400, "Participant does not exist in the group chat");
  }
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: {
        participants: participantId, // remove participant id
      },
    },
    { new: true }
  );
  const chat = await Chat.aggregate([
    {
      $match: {
        _id: updatedChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);
  const payload = chat[0];
  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }
  // emit leave chat event to the removed participant
  emitSocketEvent(req, participantId, ChatEventEnum.LEAVE_CHAT_EVENT, payload)
  return res
    .status(200)
    .json(new ApiResponse(200, payload, "Participant removed successfully"));
});

const getAllChats = asyncHandler(async (req, res) => {
  const chats = await Chat.aggregate([
    {
      $match: {
        participants: { $elemMatch: { $eq: req.user._id } }, // get all chats that have logged in user as a participant
      },
    },
    {
      $sort: {
        updatedAt: -1,
      },
    },
    ...chatCommonAggregation(),
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, chats || [], "User chats fetched successfully!")
    );
});

export {
  addNewParticipantInGroupChat,
  createAGroupChat,
  deleteGroupChat,
  getAllChats,
  getGroupChatDetails,
  leaveGroupChat,
  removeParticipantFromGroupChat,
  renameGroupChat,
  searchAvailableFriends
};
