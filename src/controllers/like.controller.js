import { asynchandler } from "../utils/asynchandler.js";
import { Project } from "../models/project.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
 

const toogleLike= asynchandler(async(req,res)=>{
    const {projectId} = req.params
  
    const project = await Project.findById(projectId)
    if(!project){
        throw new ApiError(404,"No such project found")
    }

    const like = await Like.findOne({
        user : req.user._id,
        project : projectId
    })

    if(like){
        await like.deleteOne()

          project.likesCount--
        await project.save({validateBeforeSave: false})
        return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Like removed"
            )
        )

    }


    const liked = await Like.create(
        {
        user : req.user._id,
        project : projectId
        }
    )

    

    project.likesCount++
        await project.save({validateBeforeSave: false})



    return res.status(200)
    .json(
        new ApiResponse(
            200,
            liked,
            "Like stored"
        )
    )
})

const getprojectLikes = asynchandler(async(req,res)=>{
    const {projectId} = req.params
    const project = await Project.findById(projectId)
    if(!project){
        throw new ApiError(404,"No such project exists")
    }
    const likes = await Like.find(
        {
            project : projectId
        }
    ).populate("user", "fullName avatar")
     

    if(likes.length ===0 ){
        throw new ApiError(404,"No likes on this project")
    }

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                likes,
                "All Likes Fetched"
            )
        )
    


})

const hasUserLiked = asynchandler(async(req,res)=>{
    const {projectId}= req.params

    const liked = await Like.findOne(
        {
            user: req.user._id,
            project : projectId
        }
    )

    if(liked){
        return res.status(200)
        .json(
            new ApiResponse(
                200,
                {liked : true},
                "User liked this project"
            )
        )
    }
    else{
         return res.status(200)
        .json(
            new ApiResponse(
                200,
                {liked : false},
                "User not liked this project"
            )
        )

    }
})

const getMylikedProjects = asynchandler(async(req,res)=>{
    
    const myLikedProjects = await Like.find(
        {
            user : req.user._id
        }
    ).populate(
    "project",
    "title thumbnail category likesCount commentsCount"
)

    if(myLikedProjects.length ===0){
        throw new ApiError(404,"you have not liked any projects yet")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            myLikedProjects,
            "All project liked by loginned user fetched"
        )
    )









})


export {toogleLike,getprojectLikes,hasUserLiked, getMylikedProjects}
