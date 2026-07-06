import mongoose from "mongoose";
import { required } from "zod/mini";

const commentSchema = new mongoose.Schema({
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    project:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Project",
        required : true
    },
    content:{
        type:String,
        required: true
    }
},{timestamps: true})

export const Comment = mongoose.model("Comment",commentSchema)