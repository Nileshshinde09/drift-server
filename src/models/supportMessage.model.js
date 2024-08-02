import mongoose, { Schema } from "mongoose";

const supportMessageSchema = new Schema(
  {
    senderName: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    email: {
        type: String,
        required:[true,"Email Id required!"]
    },
    subject: {
        type: String,
        required:[true,"Subject required!"]
    },
    content: {
        type: String,
        required:[true,"Content required!"]
    },
    isQueryEmail:{    //false means reply email
        type:Boolean,
        default:true
    },
    replyTo:{
        type:Schema.Types.ObjectId,
        ref:"SupportMessage",
        default:null
    }
  },
  { timestamps: true }
);

export const Chat = mongoose.model("supportMessage", supportMessageSchema);
