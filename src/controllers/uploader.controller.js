import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Images } from "../models/images.models.js";
import { Videos } from "../models/videos.model.js";
import { AnoAvatars } from "../models/anoAvatar.model.js";
import { NotificationsMultiMedia } from "../models/notificationMedia.model.js";
import { uploadOnCloudinary_V2 } from "../utils/cloudinary_v2.js";

const uploadImageContent = asyncHandler(
    async (req, res) => {
        try {
            if (!req.user) throw new ApiError(
                401,
                "User not found."
            )
            if (!req.file) throw new ApiError(
                404,
                "Image file not found."
            )
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
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { uploadedImage },
                        "Image file uploaded successfully! 🤗🤗"
                    )
                )

        } catch (error) {
            throw new ApiError(
                500,
                error.message || "Something went wrong while uploading image file"
            )
        }
    }
)

const uploadAnoAvatar = asyncHandler(
    async (req, res) => {
        try {
            if (!req.user) throw new ApiError(
                401,
                "User not found."
            )
            if (!req.file) throw new ApiError(
                404,
                "Image file not found."
            )
            const uploadedFile = await uploadOnCloudinary(req?.file?.path, "AnoAvatar")
            if (!uploadedFile) throw new ApiError(
                500,
                "Something went wrong while uploading image file on Cloudinary"
            )

            const { width, height, secure_url, asset_id, public_id, original_filename, resource_type, folder } = uploadedFile
            if (resource_type != "image") {
                throw new ApiError(
                    400,
                    "Resource type must be image."
                )
            }
            const uploadedImage = await AnoAvatars.create({
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
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { uploadedImage },
                        "AnoAvatar file uploaded successfully! 🤗🤗"
                    )
                )

        } catch (error) {
            throw new ApiError(
                500,
                error.message || "Something went wrong while uploading image file"
            )
        }
    }
)

const uploadVideoContent = asyncHandler(
    async (req, res) => {
        try {
            if (!req.user) throw new ApiError(
                401,
                "User not found."
            )
            if (!req.file) throw new ApiError(
                404,
                "Video file not found, Provide file."
            )
            const uploadedFile = await uploadOnCloudinary(req?.file?.path)
            if (!uploadedFile) throw new ApiError(
                500,
                "Something went wrong while uploading video file on Cloudinary"
            )

            const { width, height, secure_url, asset_id, public_id, original_filename, resource_type } = uploadedFile
            if (resource_type != "video") {
                throw new ApiError(
                    400,
                    "Resource type must be Video."
                )
            }
            const uploadedVideo = await Videos.create({
                uploader: req?.user?._id,
                URL: secure_url,
                width,
                height,
                asset_id,
                public_id,
                original_filename,
                resource_type
            })
            if (!uploadedVideo) throw new ApiError(
                500,
                "Something went wrong while storing Video in database !"
            )
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { uploadedVideo },
                        "Video file uploaded successfully! 🤗🤗"
                    )
                )

        } catch (error) {
            throw new ApiError(
                500,
                error.message || "Something went wrong while uploading video file."
            )
        }
    }
)

const uploadThumbnails = asyncHandler(
    async (req, res) => {
        try {
            if (!req.user) throw new ApiError(
                401,
                "User not found."
            )
            if (!req.file) throw new ApiError(
                404,
                "Image file not found."
            )
            const uploadedFile = await uploadOnCloudinary_V2(req?.file?.path, "notification_assets/music_img")
            if (!uploadedFile) throw new ApiError(
                500,
                "Something went wrong while uploading image file on Cloudinary"
            )

            const { width, height, secure_url, asset_id, public_id, original_filename, resource_type, folder } = uploadedFile
            if (resource_type != "image") {
                throw new ApiError(
                    400,
                    "Resource type must be image."
                )
            }
            const uploadedImage = await NotificationsMultiMedia.create({
                URL: secure_url,
                width,
                height,
                asset_id,
                public_id,
                original_filename,
                resource_type,
                folder:"notification_assets/music_img"
            })
            if (!uploadedImage) throw new ApiError(
                500,
                "Something went wrong while storing image in database !"
            )
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { uploadedImage },
                        "image file uploaded successfully! 🤗🤗"
                    )
                )

        } catch (error) {
            throw new ApiError(
                500,
                error.message || "Something went wrong while uploading image file"
            )
        }
    }
)
const uploadNotificationMusic = asyncHandler(
    async (req, res) => {
        try {
            // birthday
            // bollywood
            // jarvis
            // professional
            // rap  
            const { musicFolderType } = req.body;
            if (!req.user) throw new ApiError(
                401,
                "User not found."
            )
            if (!req.file || !musicFolderType) throw new ApiError(
                404,
                "Video file not found, Provide file or music folder not provided."
            )

            const folder = `notification_assets/music/${musicFolderType}`;
            const uploadedFile = await uploadOnCloudinary_V2(req?.file?.path, folder)
            if (!uploadedFile) throw new ApiError(
                500,
                "Something went wrong while uploading Audio file on Cloudinary"
            )

            const { width, height, secure_url, asset_id, public_id, original_filename, resource_type } = uploadedFile
            if (resource_type != "video") {
                throw new ApiError(
                    400,
                    "Resource type must be Audio."
                )
            }
            const uploadedAudio = await NotificationsMultiMedia.create({
                uploader: req?.user?._id,
                URL: secure_url,
                width,
                height,
                asset_id,
                public_id,
                original_filename,
                resource_type,
                folder
            })
            if (!uploadedAudio) throw new ApiError(
                500,
                "Something went wrong while storing Audio in database !"
            )
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { uploadedAudio },
                        "Audio file uploaded successfully! 🤗🤗"
                    )
                )

        } catch (error) {
            throw new ApiError(
                500,
                error.message || "Something went wrong while uploading Audio file."
            )
        }
    }
)

export {
    uploadImageContent,
    uploadVideoContent,
    uploadAnoAvatar,
    uploadThumbnails,
    uploadNotificationMusic
}