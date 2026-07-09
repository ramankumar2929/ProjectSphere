import { GoogleGenAI } from "@google/genai";
import { response } from "express";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})

const generateContent = async(prompt)=>{
    const response  = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    })

    return response.text;
}

 

export {generateContent}