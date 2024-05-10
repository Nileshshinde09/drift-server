import mongoose, { Schema } from "mongoose";

const mentionsSchema = new Schema(
    {
        mentioner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        PostId: {
            type: Schema.Types.ObjectId,
            ref: "Posts"
        },
        ToBeMention: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    },
    { timestamps: true }
)

export const Mentions = mongoose.model("Mentions", mentionsSchema);