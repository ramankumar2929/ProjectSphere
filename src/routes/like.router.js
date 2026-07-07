import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getMylikedProjects, getprojectLikes,  hasUserLiked,  toogleLike } from "../controllers/like.controller.js";

const likeRouter = Router()

likeRouter.route("/toogleLike/:projectId").post(
    verifyJWT,
    toogleLike
)   

likeRouter.route("/projectLikes/:projectId").get(
    verifyJWT,
    getprojectLikes 
)

likeRouter.route("/hasliked/:projectId").get(
    verifyJWT,
    hasUserLiked
)

likeRouter.route("/myliked").get(
    verifyJWT,
    getMylikedProjects
)



export {likeRouter}