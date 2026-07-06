import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getMyComments, getProjectComments, updateComment } from "../controllers/comment.controller.js";
 
const commentRouter = Router()

commentRouter.route("/addcomment").post(
    verifyJWT,
    addComment
)

commentRouter.route("/allcomments/:projectId").post(
    verifyJWT,
    getProjectComments
)

commentRouter.route("/update/:commentId").post(
    verifyJWT,
    updateComment
)

commentRouter.route("/delete/:commentId").post(
    verifyJWT,
    deleteComment
)

commentRouter.route("/getmyComments").get(
    verifyJWT,
    getMyComments
)



export {commentRouter}
