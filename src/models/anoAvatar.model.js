import mongoose, { Schema } from "mongoose";

const anoImagesSchema = new Schema(
    {
        URL: {
            type: String,
            required: [true, "Url Required"]
        },
        width:{
            type: String,
            default:null
        },
        height:{
            type: String,
            default:null
        },
        asset_id:{
            type:String,
            default:null
        },
        public_id:{
            type:String,
            default:null
        },
        original_filename:{
            type:String,
            default:null
        },
        folder:{
            type:String,
            default:null
        }
    },
    { timestamps: true }
)

export const AnoAvatars = mongoose.model("AnoAvatars", anoImagesSchema);



