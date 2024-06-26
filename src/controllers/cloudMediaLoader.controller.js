import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { AnoAvatars } from "../models/anoAvatar.model.js";
import { Images } from "../models/images.models.js";


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

        const { imageId } = req?.query;
        if(!imageId) throw new ApiError(
            404,
            "image Id not found "
        )
        const anoResponse  = await AnoAvatars.findById(imageId).select("-asset_id -public_id -original_filename -folder -__v -createdAt -updatedAt")
        const publicResponse = await Images.findById(imageId).select("-asset_id -public_id -original_filename -folder -__v -createdAt -updatedAt")
        if (!anoResponse && !publicResponse ) throw new ApiError(
            500,
            "Something went wrong while loading images from cloudinary !"
        )
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    response : anoResponse || publicResponse
                },
                "Images loaded successfully"
            )
        )
    }
)
export {
    loadAnoImageAssets,
    loadImageById
}