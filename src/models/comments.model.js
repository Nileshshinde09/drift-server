import mongoose,{Schema} from "mongoose";
const commentSchema= new Schema(
    {
        content: {
            type: String,
            required: [true,"Content is required"]
        },
        postId: {
            type: Schema.Types.ObjectId,
            ref: "Posts"
        },
        commentId: {                              //
            type: Schema.Types.ObjectId,         // This section is for replies
            ref: "Comments"                      //
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps:true
    }
)

export const Comments = mongoose.model("Comments",commentSchema);






