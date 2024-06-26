import mongoose, { Schema } from "mongoose";

const friendRequestSchema = new Schema(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        receiver: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        status: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        timestamps: true
    }
)

export const FriendRequests = mongoose.model("FriendRequests", friendRequestSchema);