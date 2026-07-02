import { asynchandler } from "./asynchandler.js";
import  {v2 as cloudinary} from "cloudinary"


const deleteavatar = async(avatarpublicid)=>{
    await cloudinary.uploader.destroy(avatarpublicid)
}

export {deleteavatar}