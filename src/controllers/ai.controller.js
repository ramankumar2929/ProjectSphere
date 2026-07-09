import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import {generateContent} from "../services/ai.service.js"

const testAI = asynchandler(async(req,res)=>{
    const {prompt} = req.body
    if(!prompt || prompt===""){
        throw new ApiError(404,"Prompt not given please provide prompt first")
    }

    const response = await generateContent(prompt)

    if(!response){
        throw new ApiError(400,"Issue while connecting with ai")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            response,
            "Message recieved"
        )
    )
})

export {testAI}