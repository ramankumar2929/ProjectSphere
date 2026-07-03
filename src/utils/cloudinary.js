import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { ApiError } from "./ApiError"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDNAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})

const uploadonCloudinary = async(localfilepath)=>{
      try {
            if(!localfilepath) return null
            const response = await cloudinary.uploader.upload(localfilepath,{
                resource_type:"auto"
            })
            
             fs.unlinkSync(localfilepath)
               
            return response
           
        } catch (error) {  
            fs.unlinkSync(localfilepath)
            return null
        }
}

const deletefromcloudinary = async(publicId, resource_type)=>{
    try {
        await cloudinary.uploader.destroy(publicId,{
            resource_type: resource_type
        })
    } catch (error) {
        throw new ApiError(400, error.message || "Something went wrong while deleting")
    }
}
export {uploadonCloudinary, deletefromcloudinary}