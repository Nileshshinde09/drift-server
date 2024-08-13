import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { JourneyJournals } from "../models/journyjournals.model.js"
import { Chat } from "../models/chat.model.js"
import { Follows } from "../models/follow.model.js"
import { emitSocketEvent } from "../socket/index.js"
import { ChatEventEnum, NotificationTypesEnum, NotificationURLs, NotificationMessages } from "../constants.js"
import { sendNotifications } from "../services/queue/notification.queue.js"
import mongoose from "mongoose"
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

const createJJ = asyncHandler(
  async (req, res) => {
    const { content, topic } = req.body;
    if (!req.user) throw new ApiError(
      404,
      "user not found , unauthorised access."
    )
    if (!content || !topic) throw new ApiError(
      404,
      "Content Field not found."
    )
    try {
      const followersList = await Follows.aggregate([
        {
          $match: {
            followeeId: req.user._id
          }
        },
        {
          $project: {
            followerId: 1,
            _id: 0
          }
        }
      ])

      const groupChat = await Chat.create({
        name: req.user?.username + " #" + "Journey Journals",
        isAnoGroupChat: true,
        topic,
        isAnoGroupChat: true,
        participants: [...followersList.map(follower => follower.followerId)],
        admin: req.user._id,
      });
      const JJResponse = await JourneyJournals.create(
        {
          user: req.user._id,
          content,
          space: groupChat._id,
        }
      )
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

      payload?.participants?.forEach((participant) => {
        if (participant._id.toString() === req.user._id.toString()) return;
        emitSocketEvent(
          req.app.get("io"),
          participant._id?.toString(),
          ChatEventEnum.NEW_CHAT_EVENT,
          payload
        );
        sendNotifications(
          req.user._id.toString(),
          NotificationMessages.JJ_CHAT_PARTICIPATION_MESSAGE + " " + participant?.username,
          content ? content : "",
          NotificationURLs.GROUP_CHAT_INITIALIZATION_URL + chat[0]._id.toString() + '/false',
          NotificationTypesEnum.INDIVIDUAL,
          participant._id.toString()
        )
      });

      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            {
              space: payload,
              JJ: JJResponse
            },
            "JJ chat created successfully"
          ));

    } catch (error) {
      console.log(error.message || "Something went wrong while creating JournyJournals.");
    }
  }
)
const getJJChatAndPostDetails = asyncHandler(
  async (req, res) => {
    if (!req.user) throw new ApiError(
      404,
      "user not found , unauthorised access."
    )
    const { postId } = req.params;
    const post = await JourneyJournals.findById(postId)
    if (!post) throw new ApiError(
      404,
      "Post not found!"
    )
    const groupChat = await Chat.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(post.space),
          isAnoGroupChat: true,
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
      .json(new ApiResponse(200, { chat, post }, "Group chat fetched successfully"));
  });


  const deleteJJ = asyncHandler(
    async (req, res) => {
      if (!req.user) throw new ApiError(404, "user not found , unauthorised access.");
      
      const { postId } = req.params;
      const post = await JourneyJournals.findById(postId);
      if (!post) throw new ApiError(404, "Post not found!");
  
      const groupChat = await Chat.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(post.space),
            isAnoGroupChat: true,
          },
        },
        ...chatCommonAggregation(),
      ]);
  
      const chat = groupChat[0];
  
      if (!chat) {
        throw new ApiError(404, "Journey journals does not exist");
      }
  
      if (chat.admin?.toString() !== req.user._id?.toString()) {
        throw new ApiError(404, "Only admin can delete the group");
      }
  
      console.log('Deleting chat and post');
      await Chat.findByIdAndDelete(post.space);
      await JourneyJournals.findByIdAndDelete(postId);
  
      chat?.participants?.forEach((participant) => {
        if (participant._id.toString() === req.user._id.toString()) return;
        emitSocketEvent(
          req.app.get('io'),
          participant._id?.toString(),
          ChatEventEnum.LEAVE_CHAT_EVENT,
          chat
        );
      });
  
      return res.status(200).json(new ApiResponse(200, {}, "JJ deleted successfully"));
    }
  );


const leaveGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  // check if chat is a group
  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isAnoGroupChat: true,
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

const addNewParticipantInAnoGroupChat = asyncHandler(async (req, res) => {
  const { chatId, participantId } = req.params;

  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isAnoGroupChat: true,
  });

  if (!groupChat) {
    throw new ApiError(404, "Group chat does not exist");
  }

  if (groupChat.admin?.toString() !== req.user._id?.toString()) {
    throw new ApiError(404, "You are not an admin");
  }

  const existingParticipants = groupChat.participants;

  if (existingParticipants?.includes(participantId)) {
    throw new ApiError(409, "Participant already in a group chat");
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: {
        participants: participantId,
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

const joinParticipantInAnoGroupChat = asyncHandler(async (req, res) => {
  const { postId, participantId } = req.params;
  const post = await JourneyJournals.findById(postId)
  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(post.space),
    isAnoGroupChat: true,
  });
  const isFollower = await Follows({
    followerId: participantId,
    followeeId: groupChat.admin
  })
  if (isFollower) throw new ApiError(
    403,
    "Participant must be follower of the group admin."
  )
  if (!groupChat) {
    throw new ApiError(404, "Group chat does not exist");
  }

  if (groupChat.admin?.toString() !== req.user._id?.toString()) {
    throw new ApiError(404, "You are not an admin");
  }

  const existingParticipants = groupChat.participants;

  if (existingParticipants?.includes(participantId)) {
    throw new ApiError(409, "Participant already in a group chat");
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    post.space,
    {
      $push: {
        participants: participantId,
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
  const participant_Username = await User.findById(participantId);
  // emit new chat event to the added participant
  emitSocketEvent(req, participantId, ChatEventEnum.NEW_CHAT_EVENT, payload);
  sendNotifications(
    req.user._id.toString(),
    NotificationMessages.JOIN_JJ + " " + "Participant : " + participant_Username?.username,
    content ? content : "",
    NotificationURLs.MAKE_REQUEST_URL + participant_Username?.username,
    NotificationTypesEnum.INDIVIDUAL,
    groupChat.admin.toString()
  )
  return res
    .status(200)
    .json(new ApiResponse(200, payload, "Participant added successfully"));
});

const removeParticipantFromJJGroupChat = asyncHandler(async (req, res) => {
  const { chatId, participantId } = req.params;
  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isAnoGroupChat: true,
  });
  if (!groupChat) {
    throw new ApiError(404, "Group chat does not exist");
  }
  if (groupChat.admin?.toString() !== req.user._id?.toString()) {
    throw new ApiError(404, "You are not an admin");
  }
  const existingParticipants = groupChat.participants;
  if (!existingParticipants?.includes(participantId)) {
    throw new ApiError(400, "Participant does not exist in the group chat");
  }
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: {
        participants: participantId,
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
  emitSocketEvent(req, participantId, ChatEventEnum.LEAVE_CHAT_EVENT, payload)
  return res
    .status(200)
    .json(new ApiResponse(200, payload, "Participant removed successfully"));
});

const getAllJJChats = asyncHandler(async (req, res) => {
  const chats = await Chat.aggregate([
    {
      $match: {
        participants: { $elemMatch: { $eq: req.user._id } },
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
const getAllUserPost = asyncHandler(
  async (req, res) => {
    const { username } = req.params;
    const user = await User.findOne({ username })
    if (!user) {
      throw new ApiError(
        404,
        "User not found!"
      )
    }
    const posts = await JourneyJournals.aggregate(
      [
        {
          $match: {
            user: user._id,
            hide: false
          }
        },
        {
          $sort: {
            createdAt: -1
          }
        },
      ]
    )
    if (posts) {
      return res.status(200)
        .json(
          new ApiResponse(
            200,
            posts,
            "Post fetched successfully!"
          )
        )
    }
    return res.status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "Post not found!"
        )
      )
  }
)
const updateJJ = asyncHandler(
  async (req, res) => {
    const userId = req.user._id;
    const { content, hide = false, postId } = req.body;
    if (!userId) {
      throw new ApiError(
        404,
        "User not found!"
      )
    }
    if (!content || !postId) throw new ApiError(
      404,
      "Update content not found!"
    )
    const post = await JourneyJournals.findByIdAndUpdate(postId, {
      content,
      hide
    }, { new: true })
    if (post) {
      return res.status(200)
        .json(
          new ApiResponse(
            200,
            post,
            "Post Updated successfully!"
          )
        )
    }
    return res.status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "Post not found!"
        )
      )
  }
)
const getUserJJFeed = asyncHandler(
  async (req, res) => {
    const followeesList = await Follows.aggregate([
      {
        $match: {
          followerId: req.user._id
        }
      },
      {
        $project: {
          followeeId: 1,
          _id: 0
        }
      }
    ])
    const followeeIds = [...followeesList.map(followee => followee.followeeId)]
    const aggregationPipeline = [
      {
        $match: {
          user: { $in: followeeIds },
          hide: false
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $lookup: {
          from: 'chats',
          localField: 'space',
          foreignField: '_id',
          as: 'SpaceDetails'
        }
      },
      {
        $unwind: '$SpaceDetails'
      },
      {
        $unwind: '$userDetails'
      },
      {
        $project: {
          content: 1,
          createdAt: 1,
          username: '$userDetails?.username',
          userAvatar:'$userDetails.avatar',
          topic:'$SpaceDetails.topic',
          members:'$SpaceDetails.participants',
          hide:1,
          space:1
        }
      }
    ];
    try {
      const feedPost = await JourneyJournals.aggregate(aggregationPipeline)
      if(feedPost) return res.status(200)
      .json(
        new ApiResponse(
          200,
          { feedPost },
          "Post fetched successfully"
        )
      )
      return res.status(200)
        .json(
          new ApiResponse(
            200,
            {},
            "Post not found!"
          )
        )
    } catch (error) {
      throw new ApiError(err.message || "Something went wrong while fetching posts");
    }
  });


export {
  createJJ,
  getJJChatAndPostDetails,
  deleteJJ,
  leaveGroupChat,
  addNewParticipantInAnoGroupChat,
  joinParticipantInAnoGroupChat,
  removeParticipantFromJJGroupChat,
  getAllJJChats,
  getAllUserPost,
  getUserJJFeed,
  updateJJ
}
