import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asynchandler(async (req, res, next) => {
  try {
    const token =
    
      req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }
    const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decode?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Invalid token");
    }
    req.user = user;
    
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
