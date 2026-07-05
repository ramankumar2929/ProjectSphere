import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import {Invitation} from "../models/invitation.model.js"
import { asynchandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const sendInvitation = asynchandler(async(req,res)=>{
    const {projectId, receiverId} = req.body
    const sender =  req.user._id
    console.log(projectId)
    const project = await Project.findById(projectId)
    if(!project){
        throw new ApiError(403,"Project with this projectid does not exists")
    }

    if(project.ownerid.toString() !== req.user._id.toString())
    {
        throw new ApiError(404,"Only owner can send invitations")
    }
 
    const receiver = await User.findById(receiverId)
    if(!receiver){
        throw new ApiError(404,"Receiver not found")
    }

    const isAlreadyMember = project.teamMembers.some((member)=> member.equals(receiverId))

    if(isAlreadyMember)
    {
        throw new ApiError(400,"Receiver is already a member for this project")
    }

    const existingInvitation = await Invitation.findOne({
        project: projectId,
        receiver: receiverId,
        status: "Pending"
    })

    if(existingInvitation){
        throw new ApiError(400,"Already invitaion is pending")
    }

    const invitation = await Invitation.create({
        sender,
        receiver : receiverId,
        status:"Pending",
        project: projectId

    })

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            invitation,
            "Invitation is Created"
        )
    )





})

const getMyInvitation = asynchandler(async(req,res)=>{
    const myinvitation = await Invitation.find({
       receiver: req.user._id
    })
    if(myinvitation.length ===0){
        throw new ApiError(404,"You have not received any Invitations yet")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            myinvitation,
            "Recieved invitations Fetched"

        )
    )
})

const getSentInvitation = asynchandler(async(req,res)=>{
    const myinvitation = await Invitation.find({
       sender: req.user._id
    })
    if(myinvitation.length ===0){
        throw new ApiError(404,"You have not send any Invitations yet")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            myinvitation,
            "Sent invitations fetched"

        )
    )
})

const acceptInvitation = asynchandler(async(req,res)=>{
    const {invitationId} = req.params

    const invitation = await Invitation.findById(invitationId)

    
    if(!invitation){
        throw new ApiError(404,"Such invitation not found")
    }
    if(!invitation.receiver.equals(req.user._id))
    {
        throw new ApiError(403,"You cant accept or reject someones others invitation")

    }
    if(invitation.status !=="Pending"){
        throw new ApiError(400,"Either invitation is already accepted or it is already rejected")
    }

     

    invitation.status = "Accepted"
    await invitation.save()

    const project = await Project.findById(invitation.project)
    if(!project){
        throw new ApiError(404,"Error while adding member to the team")
    }

    project.teamMembers.push(req.user._id)
    await project.save({ validateBeforeSave: false });

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            invitation,
            "Invitation accepted"
        )
    )
})

const rejectInvitation = asynchandler(async(req,res)=>{
    const {invitationId} = req.params

    const invitation = await Invitation.findById(invitationId)

    if(!invitation){
        throw new ApiError(404,"Such invitation not found")
    }
    if(!invitation.receiver.equals(req.user._id))
    {
        throw new ApiError(403,"You cant accept or reject someones others invitation")

    }
    if(invitation.status !=="Pending"){
        throw new ApiError(400,"Either invitation is already accepted or it is already rejected")
    }

    invitation.status = "Rejected"
    await invitation.save()
})





export{sendInvitation, getMyInvitation, getSentInvitation ,acceptInvitation,rejectInvitation}