import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref:"User",
    required: [true, "User ID required"]
  },
  otp: {
    type: String,
    required: true
  },
  ExpiryAt: {
    type: Date,
    default: null
  }
},
  { timestamps: true }
);

otpSchema.methods.isOTPExpired = async function(){
  return String(new Date(Date.now())) > String(this.ExpiryAt)
}

otpSchema.methods.isOTPCorrect = async function(incomingOTP){
  return String(incomingOTP) == String(this.otp)
  }


export const OTP = mongoose.model("OTP", otpSchema);
