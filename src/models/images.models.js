import mongoose, { Schema } from "mongoose";

const imagesSchema = new Schema(
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
            default:"image"
        },
        isAnoAvatar:{
            type:Boolean,
            default:false
        },
        anoAvatar:{
            type:Schema.Types.ObjectId,
            ref:"AnoAvatars",
            default:null
        },
        folder:{
            type:String,
            default:null
        }
    },
    { timestamps: true }
)

export const Images = mongoose.model("Images", imagesSchema);






// Cloudnary Response
// {
//     "asset_id": "b5e6d2b39ba3e0869d67141ba7dba6cf",
//     "public_id": "eneivicys42bq5f2jpn2",
//     "api_key": "349963819116147",
//     "version": 1570979139,
//     "version_id": "98f52566f43d8e516a486958a45c1eb9",
//     "signature": "abcdefghijklmnopqrstuvwxyz12345",
//     "width": 1000,
//     "height": 672,
//     "format": "jpg",
//     "resource_type": "image",
//     "created_at": "2023-03-11T12:24:32Z",
//     "tags": [],
//     "pages": 1,
//     "bytes": 350749,
//     "type": "upload",
//     "etag": "5297bd123ad4ddad723483c176e35f6e",
//     "placeholder": false,
//     "url": "http://res.cloudinary.com/demo/image/upload/v1570979139/eneivicys42bq5f2jpn2.jpg",
//     "secure_url": "https://res.cloudinary.com/demo/image/upload/v1570979139/eneivicys42bq5f2jpn2.jpg",
//     "folder": "",
//     "access_mode": "public",
//     "existing": false,
//     "original_filename": "sample"
//   }


