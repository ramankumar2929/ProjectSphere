 
import { Collection } from "../models/collection.model.js";
import { Project } from "../models/project.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";

const createCollection = asynchandler(async(req,res)=>{
    const {name, description} = req.body

    if(!name || name ==="")
    {
        throw ApiError(400,"Name is required")
    }
    const collection  = await Collection.findOne({
        name : name.toLowerCase(),
        user: req.user._id
    })
    if(collection){
        throw new ApiError(403,"Collection with same name already exists")
    } 

    const newCollection = await Collection.create(
        {
            name: name.toLowerCase(),
            user: req.user._id,
            description: description

        }
    )

    return res.status(201)
    .json(
        new ApiResponse(
            200,
            newCollection,
            "Collection created"
        )
    )
})

const getMyCollections = asynchandler(async(req,res)=>{
    const myCollections = await Collection.find({
        user: req.user._id
    }).populate("projects","title  thumbnail")

    if(myCollections.length===0){
        throw new ApiError(404,"No collections made by user is found")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            myCollections,
            "User collections fetched"
        )
    )
})

const addProjectToCollection = asynchandler(async(req,res)=>{
    const {collectionId,projectId}= req.params

    const collection = await Collection.findById(collectionId)
    if(!collection){
        throw new ApiError(404,"No collection Found")
    }

    const project = await Project.findById(projectId)
    if(!project){
        throw new ApiError(404,"No project Found")
    }

    if(collection.user.toString()!==req.user._id.toString()){
        throw new ApiError(403,"Only collection owner can add projects")
    }

    if(collection.projects.some((project)=> project.equals(projectId)))
    {
        throw new ApiError(403,"Project is already present in collections")
    }


     collection.projects.push(projectId)
     await collection.save()

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Project added to Collection"
        )
    )


})

const removeprojectfromcollection = asynchandler(async(req,res)=>{
    const {collectionId,projectId}= req.params

    const collection = await Collection.findById(collectionId)
    if(!collection){
        throw new ApiError(404,"No collection Found")
    }

    const project = await Project.findById(projectId)
    if(!project){
        throw new ApiError(404,"No project Found")
    }

    if(collection.user.toString()!==req.user._id.toString()){
        throw new ApiError(403,"Only collection owner can delete projects")
    }

    if(collection.projects.some((project)=> project.equals(projectId)))
    {
          collection.projects.pull(projectId)
          await collection.save()
    }
    else{
         throw new ApiError(404,"Project with given projectId does not exist in collection")
    }

     return res.status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Project removed from Collection"
        )
    )

     
})

const updateCollection = asynchandler(async(req,res)=>{
    const {name,description} = req.body
    const {collectionId}= req.params
    if(!collectionId){
        throw new ApiError(400,"Enter collection id please")
    }

     if(!name && !description){
        throw new ApiError(400,"Enter a thing to update")
     }

    const collection = await Collection.findById(collectionId)

    if(!collection){
        throw new ApiError(404,"No collection Found ")
    }

    if(collection.user.toString()!==req.user._id.toString()){
        throw new ApiError(403,"Only collection owner can update collection")
    }

    if(name){
         const similarnamecollection  = await Collection.findOne({
        name : name.toLowerCase(),
        user: req.user._id,
        _id:{
             $ne: collectionId 
        }
         
    })
    if(similarnamecollection){
        throw new ApiError(403,"Collection with same name already exists")
    }
    collection.name= name.toLowerCase()
    }

     
    if(description){
         collection.description = description
    }

    await collection.save()

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            collection,
            "Collection Updated"
        )
    )

})

const deleteCollection = asynchandler(async(req,res)=>{
    const {collectionId}= req.params
    if(!collectionId || collectionId ==="")
    {
        throw new ApiError(400,"enter collection id first")
    }

    const collection = await Collection.findById(collectionId)
    if(!collection){
        throw new ApiError(404,"Collection not found")
    }

     if(collection.user.toString()!==req.user._id.toString()){
        throw new ApiError(403,"Only collection owner can update collection")
    }

    await collection.deleteOne()
    
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Collection deleted"
            )
        )
    

})

export {createCollection,getMyCollections,addProjectToCollection,removeprojectfromcollection,updateCollection,deleteCollection}