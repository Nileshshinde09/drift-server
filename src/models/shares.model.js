import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const shareSchema = new Schema(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        recievers: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            }
        ],
        driftMoments:{
            type: Schema.Types.ObjectId,
            ref: "DriftMoments",
            default:null
        },
        journeyJournals:{
            type: Schema.Types.ObjectId,
            ref: "JourneyJournals",
            default:null
        },
        tikeTrek:{
            type: Schema.Types.ObjectId,
            ref: "TimeTrek",
            default:null
        }
    },
    { timestamps: true }
);

shareSchema.plugin(mongooseAggregatePaginate);

export const SocialFollow = mongoose.model("SocialFollow", shareSchema);
