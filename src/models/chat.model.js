import mongoose, { Schema } from "mongoose";
import { ANO_GROP_TOPICS } from "../constants.js";

const chatSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      enum:ANO_GROP_TOPICS
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    isAnoGroupChat: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "ChatMessage",
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Chat = mongoose.model("Chat", chatSchema);
