import mongoose from "mongoose";
import { required } from "zod/mini";

const likeSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },

    project:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Project",
        required: true
    }
},{timestamps: true})

export const Like = mongoose.model("Like",likeSchema)