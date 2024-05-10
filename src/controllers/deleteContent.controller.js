import { removeImageContentFromCloudinary,removeVideoContentFromCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Images } from "../models/images.models.js";
import { Videos } from "../models/videos.model.js";
const deleteImageContentFromCloudinary = asyncHandler(
    async (req,res) => {
        try 
        {
            if(!req.user) throw new ApiError(
                401,
                "User not found."
            )
            const { public_id } = req.body;

            if(!public_id) throw new ApiError(
                401,
                "Public Id of file not found."
            )
            
            const image = await Images.findOne({
                public_id
            })

            if(!image) throw new ApiError(
                404,
                "File not present in database"
            )
            if(image.resource_type != "image") throw new ApiError(
                401,
                "File format need to be image to remove from database."
            ) 

            const removedFileFromCloudinary = await removeImageContentFromCloudinary(public_id)
            
            if(!removedFileFromCloudinary) throw new ApiError(
                500,
                "Something went wrong while deleteing file from Cloudinary"
            )

            const fileDeletedFromDatabase = await Images.findByIdAndDelete(image?._id)

            if(!fileDeletedFromDatabase) throw new ApiError(
                500,
                "Something went wrong while removing file from database"
            )

            return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {fileDeletedFromDatabase},
                    "File removed from cloudinary and database successfully! 🤗🤗"
                )
            )

        } catch (error) {
            throw new ApiError(
                500,
                error.message || "Something went wrong while removing file"
            )
        }
    }
)


const deleteVideoContentFromCloudinary = asyncHandler(
    async (req,res) => {
        try 
        {
            if(!req.user) throw new ApiError(
                401,
                "User not found."
            )
            const { public_id } = req.body;

            if(!public_id) throw new ApiError(
                401,
                "Public Id of file not found"
            )
            
            const video = await Videos.findOne({
                public_id
            })

            if(!video) throw new ApiError(
                404,
                "File not present in database"
            )

            if(video?.resource_type != "video") throw new ApiError(
                401,
                "File format need to be video to remove from database."
            ) 

            const removedFileFromCloudinary = await removeVideoContentFromCloudinary(public_id)
            console.log(removedFileFromCloudinary);
            if(!removedFileFromCloudinary) throw new ApiError(
                500,
                "Something went wrong while deleteing file from Cloudinary"
            )

            const fileDeletedFromDatabase = await Videos.findByIdAndDelete(video?._id)

            if(!fileDeletedFromDatabase) throw new ApiError(
                500,
                "Something went wrong while removing file from database"
            )
            
            return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {fileDeletedFromDatabase},
                    "File removed from cloudinary and database successfully! 🤗🤗"
                )
            )

        } catch (error) {
            throw new ApiError(
                500,
                error.message || "Something went wrong while removing file"
            )
        }
    }
)

export 
{
    deleteImageContentFromCloudinary,
    deleteVideoContentFromCloudinary
}