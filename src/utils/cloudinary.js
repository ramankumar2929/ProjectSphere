import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

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
            console.log("image uploaded on cloudinary")
        } catch (error) {  
            fs.unlinkSync(localfilepath)
            return null
        }
}

export {uploadonCloudinary}