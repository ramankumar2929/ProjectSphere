import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema({
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref:"User",
        requried: true
    },
    name:{
        type:"String",
        required:true
    },

    description:{
            type:String,
            required: true
    },
    projects:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Project",
            required: true
        }
    ]

},{timestamps:true})

export const Collection = mongoose.model("Collection",collectionSchema)