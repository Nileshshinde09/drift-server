import mongoose,{Schema} from "mongoose";


const notificationsMediaSchema= new Schema(
    {
        uploader: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        URL: {
            type: String,
            required: [true, "Url Required"]
        },
        width: {
            type: String,
            default:null

        },
        height: {
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
        resource_type:{
            type:String,
            default:"image", 
            enum:["image","video"]
        },
        folder:{
            type:String,
            default:null
        }
    },
    { timestamps: true }
)

export const NotificationsMultiMedia = mongoose.model("NotificationsMultiMedia",notificationsMediaSchema);