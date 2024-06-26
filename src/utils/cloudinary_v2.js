import { v2 as cloudinary } from "cloudinary"
import { CLOUDINARY_API_KEY_V2, CLOUDINARY_API_SECRET_V2, CLOUDINARY_CLOUD_NAME_V2 } from "../constants.js"
import fs from "fs"

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME_V2,
    api_key: CLOUDINARY_API_KEY_V2,
    api_secret: CLOUDINARY_API_SECRET_V2,
})



const uploadOnCloudinary_V2 = async (localFilePath,specifiedFolder=null) => {
    try 
    {
        if(!localFilePath) return null
        let response=null
        if(specifiedFolder){
            response = await cloudinary.uploader.upload(localFilePath,{
                resource_type:"auto",
                folder: specifiedFolder
            })
        }else{
            response = await cloudinary.uploader.upload(localFilePath,{
                resource_type:"auto"
            }) 
        }
        fs.unlinkSync(localFilePath)
        return response;
    }
    catch (error)
    {
        fs.unlinkSync(localFilePath)
        return null
    }
}

export {
    uploadOnCloudinary_V2
}
