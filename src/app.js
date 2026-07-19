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
import { commentRouter } from "./routes/comment.routes.js";
import { likeRouter } from "./routes/like.router.js";
import { bookmarkRouter } from "./routes/bookmark.routes.js";
import { collectionRouter } from "./routes/collection.routes.js";
import { analyticsRouter } from "./routes/analytics.routes.js";
import { aiRouter } from "./routes/ai.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";


app.use("/api/v1/users", router)
app.use("/api/v1/projects",projectrouter)
app.use("/api/v1/invitations",invitationRouter)
app.use("/api/v1/comments",commentRouter)
app.use("/api/v1/likes",likeRouter)
app.use("/api/v1/bookmarks",bookmarkRouter)
app.use("/api/v1/collections",collectionRouter)
app.use("/api/v1/analytics",analyticsRouter)
app.use("/api/v1/ai",aiRouter)
 

app.use(errorHandler)
 
export {app}