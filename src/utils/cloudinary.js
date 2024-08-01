import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from "../constants.js"


cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
})

const uploadOnCloudinary = async (localFilePath,specifiedFolder=null) => {
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

const getAnoAssetsFromCloudinary=async (folder_name,maxResults=30,public_id)=>{
    try {
        if(!folder_name && !public_id) return null;
        const response = await cloudinary.v2.search.expression(
            `folder:${folder_name}/*`
            ).sort_by(public_id).max_results(maxResults).execute().then(result=>result);
            return response;
        } catch (error) {
        return null      
    }
}


const removeImageContentFromCloudinary=async(public_id)=>{
    try {
        if(!public_id) return null;
        const respose = await cloudinary.uploader.destroy(public_id, (result)=> result );
        return respose
    } catch (error) {

        return null
    }
}

const removeVideoContentFromCloudinary=async(public_id)=>{
    try {
        if(!public_id) return null;
        const respose  = await cloudinary.uploader.destroy(public_id,{resource_type:'video'}, (result)=> result );
        console.log(respose);
        return respose
    } catch (error) {

        return null
    }
}
export {
    uploadOnCloudinary,
    removeImageContentFromCloudinary,
    removeVideoContentFromCloudinary,
    getAnoAssetsFromCloudinary
}