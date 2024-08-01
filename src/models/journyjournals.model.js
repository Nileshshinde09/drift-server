import mongoose, { Schema } from "mongoose";


const jjSchema= new Schema(
    {
        user:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        content:{
            type:String,
            required:true
        },
        hide:{ 
            type:Boolean,
            default:false
        },
        space:{
            type:Schema.Types.ObjectId,
            ref:"Chat"
        }
    }
)

export const JourneyJournals=mongoose.model("JourneyJournals",jjSchema); 