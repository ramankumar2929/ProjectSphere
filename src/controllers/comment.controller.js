import { Comment } from "../models/comment.model.js";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";

const addComment = asynchandler(async (req, res) => {
  const { projectId, content } = req.body;

  const userId = req.user._id;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "No such Project found");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Enter comment please");
  }

  const comment = await Comment.create({
    user: userId,
    content: content,
    project: projectId,
  });
  if (!comment) {
    throw new ApiError(404, "Error while creating comment");
  }

  project.commentsCount++;
  await project.save({validateBeforeSave: false});

  return res.status(200).json(new ApiResponse(200, comment, "Comment created"));
});

const getProjectComments = asynchandler(async(req,res)=>{
    
    const {projectId} = req.params
    const project = await Project.findById(projectId)
        if(!project){
            throw new ApiError(404,"No such Projects Found")
        }
    

    const comment = await Comment.find({
        project: projectId
    })
    .populate("user", "fullName avatar")
    .sort({createdAt: -1})

    if(comment.length === 0){
        throw new ApiError(404,"No comments found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            "All comments for givrn project are fetched"
        )
    )


})

const updateComment = asynchandler(async(req,res)=>{
    const {commentId}= req.params
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404,"Comment Not found")
    }

    if(comment.user.toString()!==req.user._id.toString()){
        throw new ApiError(403,"Only user who wrote this comment can update")
    }

    const{content}= req.body

    if(!content || content.trim()===""){
        throw new ApiError(400,"Please enter new comment to update")
    }

    comment.content = content
    await comment.save()

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            "Comment is updated"
        )
    )
})

const deleteComment = asynchandler(async(req,res)=>{
    
    const {commentId}= req.params
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404,"Comment Not found")
    }
    
    const project = await Project.findById(comment.project)
    if(!project){
        throw new ApiError(404,"No such Project exists")
    }

    if(comment.user.toString()!==req.user._id.toString()){
        throw new ApiError(403,"Only user who wrote this comment can delete it")
    }

    await comment.deleteOne()

    project.commentsCount--
    await project.save({validateBeforeSave: false})

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Comment deleted"
        )
    )
})

const getMyComments = asynchandler(async(req,res)=>{
    
    const mycomments = await Comment.find({
        user: req.user._id
    }).populate("project","title thumbnail")
    if(mycomments.length===0){
        throw new ApiError(404,"No such comments found")
    }

    return res.status(200)
    .json(
         new ApiResponse(
            200,
            mycomments,
            "Comments fetched"
         )
    )
})


export {addComment,getProjectComments,updateComment,deleteComment,getMyComments}