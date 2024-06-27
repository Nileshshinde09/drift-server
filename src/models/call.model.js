import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { CallTypesEnum } from "../constants.js";
const callSchema = new Schema(
  {
    caller:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    receiver : {
      type: Schema.Types.ObjectId,
      ref: "User",
      required:true
    },
    duration:{
        type:Date,
        default:null
    },
    isAccepted:{
        type:Boolean,
        default:false
    },
    callType:{
        type:String,
        enum:CallTypesEnum,
        default:CallTypesEnum.VOICE
    }
  },
  { timestamps: true }
);

callSchema.plugin(mongooseAggregatePaginate);

callSchema.methods.calDuration= async function(){
    const duration = new Date(Date.now()) - new Date(this.updatedAt)
    if(duration){
        this.duration = duration;
        return true
    }
    return false
}

export const Call = mongoose.model("Call", callSchema);
