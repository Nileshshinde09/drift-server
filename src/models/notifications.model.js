import mongoose,{Schema} from "mongoose";
import {TYPES_OF_NOTIFICATION} from "../constants.js"

const notificationsSchema= new Schema(
    {
        sender:{
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        payload:{
            type:String,
            default:null
        },
        typeOfNotification:{
            type:String,
            enum:TYPES_OF_NOTIFICATION,
            required:[true,"Type of Notifaction Required"],
        },
        audience:{
            type:Number,
            min:0,
            default:null,
        }
    },
    {
        timestamps:true
    }
)

export const Notifications = mongoose.model("Notifications",notificationsSchema);