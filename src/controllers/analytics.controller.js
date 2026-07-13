import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Collection } from "../models/collection.model.js";
import { Bookmark } from "../models/bookmark.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";

const getMostViewedProjects = asynchandler(async (req, res) => {
  const projectsinorder = await Project.find()
    .sort({ views: -1 })
    .limit(10)
    .select("title views ownerid thumbnail slug")
    .populate("ownerid", "fullName avatar");

  if (projectsinorder.length === 0) {
    throw new ApiError(400, "No projects are made yet");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, projectsinorder, "Most viewed projects are shown")
    );
});

const getMostLikedProjects = asynchandler(async (req, res) => {
  const projectsinorder = await Project.find()
    .sort({ likesCount: -1 })
    .limit(10)
    .select("title likesCount ownerid thumbnail slug")
    .populate("ownerid", "fullName avatar");

  if (projectsinorder.length === 0) {
    throw new ApiError(400, "No projects are made yet");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, projectsinorder, "Most liked projects are shown")
    );
});

const getLatestProjects = asynchandler(async (req, res) => {
  const projectsinorder = await Project.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("title createdAt ownerid thumbnail slug")
    .populate("ownerid", "fullName avatar");

  if (projectsinorder.length === 0) {
    throw new ApiError(400, "No projects are made yet");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectsinorder,
        "Recently created projects are shown"
      )
    );
});

const getTrendingProjects = asynchandler(async (req, res) => {
  const projectsinorder = await Project.find()
    .sort({
      likesCount: -1,
      commentsCount: -1,
      views: -1,
    })
    .limit(5)
    .select("_id title likesCount commentsCount views ownerid thumbnail slug")
    .populate("ownerid", "fullName avatar");

  if (projectsinorder.length === 0) {
    throw new ApiError(400, "No projects are made yet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, projectsinorder, "Trending projects are shown"));
});

const getPlatformStats = asynchandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalProjects = await Project.countDocuments();
  const totalLikes = await Like.countDocuments();
  const totalComments = await Comment.countDocuments();
  const totalCollections = await Collection.countDocuments();
  const totalBookmarks = await Bookmark.countDocuments();

  const viewcount = await Project.aggregate([
    {
      $group: {
        _id: null,
        viewcount: { $sum: "$views" },
      },
    },
  ]);
  const totalViews = viewcount[0]?.viewcount || 0;

  return res.status(200).json(
    new ApiResponse(200, {
      totalUsers,
      totalProjects,
      totalLikes,
      totalComments,
      totalBookmarks,
      totalCollections,
      totalViews,
    } ,"Complete info fetched")
  );
});


export {getMostViewedProjects,getMostLikedProjects,getLatestProjects,getTrendingProjects,getPlatformStats}