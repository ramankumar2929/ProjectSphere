import { Router } from "express";
import { createProject } from "../controllers/project.controller.js";
import { upload } from "../middlewares/multer.middleware.js";



const projectrouter = Router()

projectrouter.route("/createproject").post(
   upload.fields([
    {
        name:"screenshots",
        maxCount: 10

    },
    {
        name:"documents",
        maxCount: 5
    }
   ]),
    createProject
)

export {projectrouter}
