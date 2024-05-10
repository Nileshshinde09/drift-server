import mongoose,{Schema} from "mongoose";

const videosSchema= new Schema(
    {
        uploader: {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
        URL:{
            type:String,
            required:[true,"Url Required"]
        },
        width:{
            type:String,
            required:[true,"Width Required"]
      },
        height:{
            type:String,
            required:[true,"Height Required"]
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
            default:"video"
        },
        length:{
            type:String,
            default:null
        },
},
    {timestamps:true}
)

export const Videos = mongoose.model("Videos",videosSchema);

