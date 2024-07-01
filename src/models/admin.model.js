import mongoose,{ Schema } from "mongoose"

const adminSchema = new Schema(
    {
        user:{
            type: Schema.Types.ObjectId,
            ref:"User",
            required:[
                true,
                "User required"
            ]
        },
        ip:{
            type:String,
            required:[
                true,
                "Ip is Required to make admin"
            ]
        }
    },
    {
        timestamps:true
    }
)
export const Admin = mongoose.model("Admin",adminSchema);

