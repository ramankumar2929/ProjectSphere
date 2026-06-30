import mongoose from "mongoose";
import { asynchandler } from "../utils/asynchandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asynchandler(async (req, res) => {
  const { username, fullName, email, password, bio, github, linkedIn, skills } =
    req.body;

  if (
    [username, fullName, email, password, bio].some(
      (field) => field?.trim() == ""
    )
  ) {
    throw new ApiError(400, "These fields are required");
  }

  if (typeof email !== "string" || !email.includes("@")) {
    throw new ApiError(400, "email must contain @ and it should be string");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "user with email or this username already exists");
  }

  let avatarLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files.avatar[0].path;
  } else {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadonCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "avatar not uploaded on cloudinary");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    email,
    password,
    username: username.toLowerCase(),
    bio,
    github,
    linkedIn,
    skills,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(400, "Something went wrong while registering the user");
  }

  return res
  .status(200)
  .json(new ApiResponse(200,createdUser,"User Registered Successfully"))
});


export {registerUser}