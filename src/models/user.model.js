import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PROFILE_BANNER , GENDER_TYPE, ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRY,RESET_FOROGT_PASSWORD_SECURITY_TOKEN_SECRET,RESET_FOROGT_PASSWORD_TOKEN_EXPIRY } from "../constants.js";

const userSchema = new Schema(
    {
        //User Profile
        username:{
            type:String,
            required : [true,"Username required"],
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:[true,"Email required"],
            lowercase:true,
            trim:true,
        },
        fullName:{
            type:String,
            required:[true,"FullName required"],
            trim:true,
            index:true,
        },
        gender:{
            type:String,
            enum:GENDER_TYPE,
            default:null
        },
        dob:{
            type: Date,
            default: null,
          },
        avatar:{
            type:Schema.Types.ObjectId, //Id
            ref:"Images",
            default:null
        },
        profileBanner:{
            type:String, //url
            enum:PROFILE_BANNER,
            default:null,
        },
        bio:{
            type:String,
            default:null
        },
        status:{
            type:String,
            enum:["Online","Offline","Busy","Away"],
            default:null
        },
        //Auth
        emailVerified:{
            type:Boolean,
            default:false
        },
        password:{
            type:String,
            required:[true,"Password is required"]
        },
        refreshToken:{
            type:String
        }
    },
    {
        timestamps:true
    }
)


userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10)
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken= async function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this?.username,
            fullName: this.fullName
        },
        ACCESS_TOKEN_SECRET,
        {
            expiresIn:ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateResetPasswordSecurityToken = async function(){
    return jwt.sign(
      {
        _id:this._id,
        username:this?.username,
        email:this.email
      },
      RESET_FOROGT_PASSWORD_SECURITY_TOKEN_SECRET,
      {
        expiresIn:RESET_FOROGT_PASSWORD_TOKEN_EXPIRY,
      } 
    )
}

userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User",userSchema);