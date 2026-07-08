import { Bookmark } from "../models/bookmark.model.js";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";

const toggleBookmark = asynchandler(async(req,res)=>{
    const {projectId}= req.params

    const project = await Project.findById(projectId)
    if(!project){
        throw new ApiError(404,"No project found")
    }

    const bookmark = await Bookmark.findOne({
        user : req.user._id,
        project : projectId
    })

    if(bookmark){
        await bookmark.deleteOne()
        return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Bookmark Removed"
            )
        )
    }
    
    const projectbookmark = await Bookmark.create({
        user: req.user._id,
        project: projectId
    })

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            projectbookmark,
            "Bookmark is created"

        )
    )

})

const getMyBookmarks = asynchandler(async(req,res)=>{
    const myBookmarks = await Bookmark.find({
        user: req.user._id
    }).populate("project","title")

    if(myBookmarks.length===0){
        throw new ApiError(404,"You have no bookmarked projects")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            myBookmarks,
            "My Bookmarks Fetched"
        )
    )
})

const hasUserBookmarked= asynchandler(async(req,res)=>{
    const {projectId} =req.params
    const project = await Project.findById(projectId)
    if(!project){
        throw new ApiError(404,"No such Projects Found")
    }

    const mybookmarkedProject = await Bookmark.findOne({
        user: req.user._id,
        project: projectId
    })

    if(mybookmarkedProject){
        return res.status(200)
        .json(
            new ApiResponse(
                200,
                {bookmarked: true},
                "Yes project is Bookmarked"
            )
        )
    }
    else{
         return res.status(200)
        .json(
            new ApiResponse(
                200,
                {bookmarked: false},
                "No project is not Bookmarked"
            )
        )
    }


})

export  {toggleBookmark,getMyBookmarks,hasUserBookmarked}