import mongoose from "mongoose";
import { asynchandler } from "../utils/asynchandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { deleteavatar } from "../utils/deleteavatar.js";

const createAccessTokenandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    // saved refreshToken in mongodb
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating Tokens");
  }
};

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

  if (typeof email !== "string" || !email.includes("@gmail.com")) {
    throw new ApiError(
      400,
      "email must contain (@gmail.com) and it should be string"
    );
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
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

const loginUser = asynchandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or Email is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const ispasscorrect = await user.isPasswordCorrect(password);
  if (!ispasscorrect) {
    throw new ApiError(401, "Entered Password is Incorrect");
  }

  const { accessToken, refreshToken } = await createAccessTokenandRefreshToken(
    user._id
  );

  const LoginnedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: false,
    secure: false,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { LoginnedUser, accessToken: accessToken, refreshToken: refreshToken },
        "User loggined Successfully"
      )
    );
});

const refreshaccessToken = asynchandler(async (req, res) => {
  const incomingrefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;
  if (!incomingrefreshToken) {
    throw new ApiError(401, "unautorized request");
  }
  try {
    const decodedtoken = await jwt.verify(
      incomingrefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!decodedtoken) {
      throw new ApiError(400, "fetched refreshToken is invalid");
    }

    const user = await User.findById(decodedtoken._id);
    if (!user) {
      throw new ApiError(401, "user not found");
    }

    if (incomingrefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: false,
    };

    const { accessToken, refreshToken: newrefreshToken } =
      await createAccessTokenandRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newrefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(404, error?.message || "invalid refresh token");
  }
});

const logoutUser = await asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: {
      refreshToken: 1,
    },
  });

  const options = {
    httpOnly: true,
    secure: false,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const changeCurrentPassword = await asynchandler(async (req, res) => {
  const { oldpassword, newpassword } = req.body;

  const user = await User.findById(req.user._id);

  const ispasswordcorrect = await user.isPasswordCorrect(oldpassword);
  if (!ispasswordcorrect) {
    throw new ApiError(400, "Invalid old password");
  }
  user.password = newpassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"));
});

const updateAccountDetails = asynchandler(async (req, res) => {
  const { fullName, bio, skills, github, linkedIn } = req.body;

  if (!fullName && !bio && !skills && !github && !linkedIn) {
    throw new ApiError(400, "Changing fields are required");
  }
  const updateFields = {};

  if (fullName !== undefined) updateFields.fullName = fullName;
  if (bio !== undefined) updateFields.bio = bio;
  if (skills !== undefined) updateFields.skills = skills;
  if (github !== undefined) updateFields.github = github;
  if (linkedIn !== undefined) updateFields.linkedIn = linkedIn;

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: updateFields
      
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "account updated successfully"));
});

const updateUserAvatar = asynchandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadonCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }
  // for deleting old image from cloudinary 
  const existeduser = await User.findById(req.user?._id);

  const imageurl = existeduser.avatar;

  const publicId = imageurl
    .split("/upload/")[1]
    .split(".")[0]
    .replace(/^v\d+\//, "");

  await deleteavatar(publicId);
  console.log("old image deleted successfully")

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const getCurrentUser = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

export {
  registerUser,
  loginUser,
  refreshaccessToken,
  logoutUser,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvatar,
  getCurrentUser
};
