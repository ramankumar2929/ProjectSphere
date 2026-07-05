import mongoose, { mongo } from "mongoose";
import { User } from "./user.model.js";
import { Project } from "./project.model.js";

const invitationSchema  = new mongoose.Schema(
    {
        sender:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true
        },

        receiver:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true
        },

        project:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"Project",
            required: true
        },

        status:{
            type: String,
            required: true
        }

    },
{timestamps: true})

export const Invitation = mongoose.model("Invitation", invitationSchema)