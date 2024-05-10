import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary, removeImageContentFromCloudinary } from "../utils/cloudinary.js";
import { Images } from "../models/images.models.js"
import { Schema } from "mongoose";

const setProfileImage = asyncHandler(
    async (req, _, next) => {
        const userId = req.user?._id;
        if (req?.body?.avatar) return next()
        if (!userId) throw new ApiError(
            400,
            "User not found , unathorised access"
        )

        if (avatar) {
            return next()
        }

        if (!req.file) throw new ApiError(
            404,
            "Image file not found."
        )
        try {
            const uploadedFile = await uploadOnCloudinary(req?.file?.path)
            if (!uploadedFile) throw new ApiError(
                500,
                "Something went wrong while uploading image file on Cloudinary"
            )

            const { width, height, secure_url, asset_id, public_id, original_filename, resource_type } = uploadedFile
            if (resource_type != "image") {
                throw new ApiError(
                    400,
                    "Resource type must be image."
                )
            }
            const uploadedImage = await Images.create({
                uploader: req?.user?._id,
                URL: secure_url,
                width,
                height,
                asset_id,
                public_id,
                original_filename,
                resource_type,
            })
            if (!uploadedImage) throw new ApiError(
                500,
                "Something went wrong while storing image in database !"
            )
            req.user.avatar = uploadedImage?._id
            next()
        } catch (error) {
            throw new ApiError(
                500,
                error.message || "Something went wrong while uploading image file"
            )
        }
    }
)

const removeProfileImage = asyncHandler(
    async (req, _, next) => {
        const userId = req.user?._id;
        if (!userId) throw new ApiError(
            400,
            "User not found , unathorised access"
        )
        try {
            if (req?.body?.avatar) {
                const isAnoImage = await Images.aggregate(
                    [
                        {
                            $match: {
                                _id: Schema.Types.ObjectId(req?.body?.avatar),
                                folder: "AnoAvatar",
                            },
                        },

                    ]
                )
                if (isAnoImage) {
                    req?.body?.avatar = null
                    return next()
                }
                const deletedImageResponse = await removeImageContentFromCloudinary(req?.body?.avatar)

                if (!deletedImageResponse) throw ApiError(
                    500,
                    "Something went wrong while removing image from cloud"
                )
                return next()

            }
        } catch (error) {
            throw new ApiError(
                500,
                error?.message || "Something went wrong while removing image from cloud"
            )
        }

    }
)


export {
    setProfileImage,
    removeProfileImage
}



