import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

const app =  express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended : true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import router from "./routes/user.routes.js"
import { projectrouter } from "./routes/project.routes.js";
import { invitationRouter } from "./routes/invitation.routes.js";


app.use("/api/v1/users", router)
app.use("/api/v1/projects",projectrouter)
app.use("/api/v1/invitations",invitationRouter)

 
export {app}