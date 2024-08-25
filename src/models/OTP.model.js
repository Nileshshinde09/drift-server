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
  const currentTime = Date.now();
  const expiryTime = this.ExpiryAt.getTime();

  return new Date(currentTime).toISOString().split('T')[1] > new Date(expiryTime).toISOString().split('T')[1];
}

otpSchema.methods.isOTPCorrect = async function(incomingOTP){
  console.log(String(incomingOTP));
  console.log(String(this.otp));

  
  return String(incomingOTP) === String(this.otp)
  }


export const OTP = mongoose.model("OTP", otpSchema);
