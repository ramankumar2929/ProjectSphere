import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getMyBookmarks, hasUserBookmarked, toggleBookmark } from "../controllers/bookmark.controller.js";

const bookmarkRouter = Router()

bookmarkRouter.route("/togglebookmark/:projectId").post(
    verifyJWT,
    toggleBookmark
)

bookmarkRouter.route("/getMyBookmarks").get(
    verifyJWT,
    getMyBookmarks
)

bookmarkRouter.route("/hasBookmarked/:projectId").get(
    verifyJWT,
    hasUserBookmarked
)
export{bookmarkRouter}