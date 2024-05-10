import mongoose, { Schema } from "mongoose";

const viewSchema = new Schema({
  PostId: {
    type: Schema.Types.ObjectId,
    ref: "Posts",
    default: null,
  },
  commentId: {
    type: Schema.Types.ObjectId,
    ref: "Comments",
    default: null,
  },
  viewedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
},
  { timestamps: true });

const View = mongoose.model('View', viewSchema);

module.exports = View;
