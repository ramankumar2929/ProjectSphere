import { Router } from "express";
import {
  contributedProjects,
  createProject,
  deleteProject,
  getAllProjects,
  getMyProjects,
  getProjectById,
  searchProjects,
  updateProject,
} from "../controllers/project.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
 

const projectrouter = Router();

projectrouter
  .route("/")
  .post(
    verifyJWT,
    upload.fields([
      {
        name: "screenshots",
        maxCount: 10,
      },
      {
        name: "documents",
        maxCount: 5,
      },
    ]),

    createProject
  )
  .get(getAllProjects);

 
//search projects
 projectrouter.route("/search").get(
    searchProjects
 )
 // my all projects
 projectrouter.route("/myprojects").get(verifyJWT,getMyProjects)

 //contributed projects
 projectrouter.route("/contributed").get(verifyJWT,contributedProjects)

   // for using projectid to getproject ,updateproject , deleteProject
projectrouter
  .route("/:projectId")
  .get(getProjectById)
  .patch(
    verifyJWT,
    upload.fields([
      {
        name: "screenshots",
        maxCount: 10,
      },
      {
        name: "documents",
        maxCount: 5,
      },
    ]),

    updateProject
  )
  .delete(
    verifyJWT,
    deleteProject
  )

export { projectrouter};
