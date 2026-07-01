import mongoose, { mongo } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { string } from "zod";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // getitfrom url
      required: true,
    },
    recentlyViewedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    password: {
      type: String,
      required: ["true", "Password is required"],
    },
    refreshToken: {
      type: String,
    },
    bio:{
        type: String,
        required: true
    },
    github:{
        type: String

    },
    linkedIn:{
        type: String,

    },

    skills:{
        type: string,
        required: true
    }
  },
  { timestamps: true }
);

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return ;
    this.password = await bcrypt.hash(this.password,10)
    next
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id:this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
process.env.ACCESS_TOKEN_SECRET,
{
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
}

)
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id:this._id,
        
    },
process.env.REFRESH_TOKEN_SECRET,
{
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
}

)
}


export const User = mongoose.model("User", userSchema);
