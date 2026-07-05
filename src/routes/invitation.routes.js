import { Router } from "express";
import { acceptInvitation, getMyInvitation, getSentInvitation, rejectInvitation, sendInvitation } from "../controllers/invitation.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const invitationRouter  = Router()

invitationRouter.route("/sendinvitation").post(
    verifyJWT,
    sendInvitation
)

invitationRouter.route("/getMyInvitation").get(verifyJWT,getMyInvitation)
invitationRouter.route("/getSentInvitation").get(verifyJWT,getSentInvitation)
invitationRouter.route("/acceptInvitation/:invitationId").patch(verifyJWT,acceptInvitation)
invitationRouter.route("/rejectInvitation").patch(verifyJWT,rejectInvitation)


export{invitationRouter}