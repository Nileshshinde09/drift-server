import mongoose, { Schema } from "mongoose";

const likesSchema = new Schema(
    {
        PostId:{
            type: Schema.Types.ObjectId,
            ref: "Posts",
            default: null,
        },
        commentId:{
            type: Schema.Types.ObjectId,
            ref: "Comments",
            default: null,
        },
        likedBy:{
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
)

export const Likes = mongoose.model("Likes", likesSchema);