import mongoose, { mongo } from "mongoose";

const projectSchema = new mongoose.Schema({
    
},{timestamps:true})

const Project = mongoose.model("Project",projectSchema)