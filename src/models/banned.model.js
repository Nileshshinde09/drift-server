import mongoose,{Schema} from "mongoose";
import { BAN_REASONS,FEATURE_SECTIONS,FEATURE_SECTIONS_ENUM,PROHIBITION_DURATION } from "../constants";

const reportsSchema = new Schema(
    {
        initiator:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        reason:{
            type:String,
            enum:BAN_REASONS,
            required:true
        },
        featureSectionType:{
            type:String,
            enum:FEATURE_SECTIONS,
            required:true
        }
    },
    {timestamps:true}
)


const bannedSchema= new Schema(
    {
        user:{
            type: Schema.Types.ObjectId,
            ref:"User"
        },
        reports:[reportsSchema],
        prohibitionDuration:{
            type:String,
            enum:PROHIBITION_DURATION,
            required:true,
            default:"0"
        },
        prohibitionFeature:{
            type:String,
            enum:FEATURE_SECTIONS,
            default:FEATURE_SECTIONS_ENUM.OVERALL
        }
        
    },
    {timestamps:true}
)

export const Banned = mongoose.model("Banned",bannedSchema);