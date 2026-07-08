import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    project:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Project"
    }
},{timestamps:true})

export const Bookmark = mongoose.model("Bookmark",bookmarkSchema)