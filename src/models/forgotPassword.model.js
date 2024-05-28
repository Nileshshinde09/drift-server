import mongoose, { Schema } from "mongoose";

const forgotPasswordSchema = new Schema(
    {
        userId:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required : [true,"User id required"],
        },
        resetPasswordToken:{
            type:String,
            required:[true,"Token required"]
        }
    },
    {
        timestamps:true
    }
)

export const ForgotPassword = mongoose.model("ForgotPassword",forgotPasswordSchema);