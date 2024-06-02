import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const PostsSchema= new Schema(
    {
        ownerId:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:[true,"Owner Required"]
        },
        images: [
            {
                type: Schema.Types.ObjectId,
                ref: "Images",
            }
        ],
        tags: {
            type: [String],
            default: [],
          },
        video:
        {
            type: Schema.Types.ObjectId,
            ref: "Videos",
            default:null
        },
        caption: {
            type: String,
            default: null
        }
    },
    {timestamps:true}
)
PostsSchema.plugin(mongooseAggregatePaginate);
export const Posts = mongoose.model("Posts",PostsSchema);