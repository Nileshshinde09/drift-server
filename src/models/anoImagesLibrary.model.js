import mongoose,{Schema} from "mongoose";
import { GENDER_TYPE } from "../constants.js"
const anoImagesLibrarySchema= new Schema(
    {
        imageName:{
            type:String,
            required:[true,"Image name Required"]
        },
        Url:{
            type:String,
            required:[true,"Image Url Required"]
        },
        gender:{
            type:String,
            enum:GENDER_TYPE,
              
        },
        uploaderName:{
            type:String,
            default:null
        }
    },
    {timestamps:true}
)

export const AnoImagesLibrary = mongoose.model("AnoImagesLibrary",anoImagesLibrarySchema);