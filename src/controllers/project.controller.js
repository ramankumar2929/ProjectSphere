import { file } from "zod";
import { Project } from "../models/project.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";

const createProject = asynchandler(async (req, res) => {
  const {
    owner,
    title,
    description,
    technologies,
    category,
    tags,
    difficulty,
    githubLink,
    liveDemo,
    thumbnail,
    teamMembers,
    status,
  } = req.body;

  if ([owner, title].some((field) => field?.trim() == "")) {
    throw new ApiError(400, "These fields are required");
  }

  const existedProject = await Project.findOne({
    $and: [{ owner }, { title }],
  });

  if (existedProject) {
    throw new ApiError(
      400,
      "Similar project already named If possible change Title"
    );
  }

   let screenshotLocalPath;

 if(req.files && Array.isArray(req.files.screenshots) && req.files.screenshots.length>0 ){
  screenshotLocalPath = req.files.screenshots.map((file)=> file.path)
 }

 if(!screenshotLocalPath){
  throw new ApiError(400, "There is issue whilefinding screenshots images paths")
 }

 let documentsLocalPath ;

  if (
    req.files &&
    Array.isArray(req.files.documents) &&
    req.files.documents.length > 0
  ) {
    documentsLocalPath = req.files.documents.map((file) => file.path)
  }

  const uploadedScreenshots = await Promise.all(
  screenshotLocalPath.map((path) => 
     uploadonCloudinary(path)
  )
);

  const uploadedDocuments = await Promise.all(
    documentsLocalPath.map((path)=>
       uploadonCloudinary(path)
    )
  )

  console.log(uploadedScreenshots)
  console.log(uploadedDocuments)


    








});


export {createProject}
