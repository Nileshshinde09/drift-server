import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { AnoAvatars } from "../models/anoAvatar.model.js";


const loadAnoImageAssets= asyncHandler(
    async (req,res)=>{
        const response  = await AnoAvatars.find({}).select("-asset_id -public_id -original_filename -folder -__v -createdAt -updatedAt")
        if (!response) throw new ApiError(
            500,
            "Something went wrong while loading images from cloudinary !"
        )
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                response,
                "Images loaded successfully"
            )
        )
    }
)

const loadImageById= asyncHandler(
    async (req,res)=>{
        const response  = await AnoAvatars.find({}).select("-asset_id -public_id -original_filename -folder -__v -createdAt -updatedAt")
        if (!response) throw new ApiError(
            500,
            "Something went wrong while loading images from cloudinary !"
        )
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                response,
                "Images loaded successfully"
            )
        )
    }
)

export {
    loadAnoImageAssets
}