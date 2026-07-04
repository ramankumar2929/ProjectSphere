import { file } from "zod";
import { Project } from "../models/project.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deletefromcloudinary } from "../utils/cloudinary.js";
 

const createProject = asynchandler(async (req, res) => {
  const ownername = req.user.fullName;
  const ownerid = req.user._id;
  const {
    title,
    description,
    technologies,
    category,
    tags,
    difficulty,
    githublink,
    liveDemo,
    status,
  } = req.body;

  let teamMembers = req.body.teamMembers;
  if (teamMembers) {
    teamMembers = JSON.parse(teamMembers);
  }

  if ([ownername, title].some((field) => field?.trim() == "")) {
    throw new ApiError(400, "These fields are required");
  }

  const existedProject = await Project.findOne({
    $and: [{ ownerid }, { title }],
  });

  if (existedProject) {
    throw new ApiError(
      400,
      "Similar project already named If possible change Title"
    );
  }

  let screenshotLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.screenshots) &&
    req.files.screenshots.length > 0
  ) {
    screenshotLocalPath = req.files.screenshots.map((file) => file.path);
  }

  if (!screenshotLocalPath) {
    throw new ApiError(
      400,
      "There is issue whilefinding screenshots images paths"
    );
  }

  let documentsLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.documents) &&
    req.files.documents.length > 0
  ) {
    documentsLocalPath = req.files.documents.map((file) => file.path);
  }

  if (!documentsLocalPath) {
    throw new ApiError(400, "There is issue whilefinding documents paths");
  }

  const uploadedScreenshots = await Promise.all(
    screenshotLocalPath.map((path) => uploadonCloudinary(path))
  );

  const uploadedDocuments = await Promise.all(
    documentsLocalPath.map((path) => uploadonCloudinary(path))
  );

  if (!uploadedDocuments || !uploadedScreenshots) {
    throw new ApiError(400, "Error while uploading on cloudinary");
  }
  

  const project = await Project.create({
    ownerid,
    ownername,
    title,

    description,
    technologies,
    category,
    tags,
    difficulty,
    githublink,
    liveDemo,
    thumbnail: {
      url: uploadedScreenshots[0].secure_url,
      public_id: uploadedScreenshots[0].public_id,
      resource_type: uploadedScreenshots[0].resource_type,
    },
    teamMembers,
    status,
    screenshots: uploadedScreenshots.map((screenshot) => ({
      url: screenshot.secure_url,
      public_id: screenshot.public_id,
      resource_type: screenshot.resource_type,
    })),
    documents: uploadedDocuments.map((document) => ({
      url: document.secure_url,
      public_id: document.public_id,
      resource_type: document.resource_type,
    })),
  });

  if (!project) {
    throw new ApiError(400, "Error while creating Project");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project is Created"));
});

const getAllProjects = asynchandler(async (req, res) => {
  const projects = await Project.find();

  if (getAllProjects.length === 0) {
    throw new ApiError(404, "No Projects found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, projects, "All projects are Here"));
});

const getProjectById = asynchandler(async (req, res) => {
  const { projectId } = req.params;

  console.log(req.params.projectId)
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project with given id is not found");
  }
  project.views += 1;  
  await project.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, project, "Project Fetched"));
});  

const updateProject = asynchandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project with such id doesn't found");
  }

  if (project.ownerid.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only owner of this project can update");
  }

  const {
    title,
    description,
    technologies,
    category,
    tags,
    difficulty,
    githubLink,
    liveDemo,
    teamMembers,
    status,
  } = req.body;
  

  const updateFields = {};

  if (title !== undefined) {
    updateFields.title = title;
    updateFields.slug = slugify(title, {
      lower: true,
      strict: true,
    });
  }
  if (description !== undefined) updateFields.description = description;
  if (technologies !== undefined) updateFields.technologies = technologies;
  if (category !== undefined) updateFields.category = category;
  if (tags !== undefined) updateFields.tags = tags;
  if (difficulty !== undefined) updateFields.difficulty = difficulty;
  if (githubLink !== undefined) updateFields.githubLink = githubLink;
  if (liveDemo !== undefined) updateFields.liveDemo = liveDemo;
  if (teamMembers !== undefined) {updateFields.teamMembers = JSON.parse(teamMembers);}
  if (status !== undefined) updateFields.status = status;

  let screenshotLocalPath;
  if ( 
    req.files &&
    Array.isArray(req.files.screenshots) &&
    req.files.screenshots.length > 0
  ) {
    screenshotLocalPath = req.files.screenshots.map((file) => file.path);
  }

  let documentsLocalPath; 

  if (
    req.files &&
    Array.isArray(req.files.documents) &&
    req.files.documents.length > 0
  ) {
    documentsLocalPath = req.files.documents.map((file) => file.path);
  }

  if (
  !title &&
  !description &&
  !technologies &&
  !category &&
  !tags &&
  !difficulty &&
  !githubLink &&
  !liveDemo &&
  !teamMembers &&
  !status &&  
  !screenshotLocalPath &&
  !documentsLocalPath
) {
  throw new ApiError(400, "Please fill things to update");
}

  

  if (screenshotLocalPath) {
    //deleting old screenshots
     
    for (const screenshot of project.screenshots) {
      await deletefromcloudinary(
        screenshot.public_id,
        screenshot.resource_type
      );
    }

    //uploading new screenshots
    const uploadedScreenshots = await Promise.all(
      screenshotLocalPath.map((path) => uploadonCloudinary(path))
    );

    updateFields.screenshots = uploadedScreenshots.map((screenshot) => ({
      url: screenshot.secure_url,
      public_id: screenshot.public_id,
      resource_type: screenshot.resource_type,
    }));

    updateFields.thumbnail = {
      url: uploadedScreenshots[0].secure_url,
      public_id: uploadedScreenshots[0].public_id,
      resource_type: uploadedScreenshots[0].resource_type,
    };
  }

  if(documentsLocalPath){
    //deleting old documents
      
    for (const document of project.documents) {
      await deletefromcloudinary(
        document.public_id,
        document.resource_type
      );
    }

    //uploading new documents
     const uploadedDocuments = await Promise.all(
      documentsLocalPath.map((path) => uploadonCloudinary(path))
    );

    updateFields.documents = uploadedDocuments.map((document) => ({
      url: document.secure_url,
      public_id: document.public_id,
      resource_type: document.resource_type,
    }));

  }

  const updatedProject = await Project.findByIdAndUpdate(
    projectId,
    {
      $set: updateFields,
    },
    {
      new: true,
    }
  );

  if (!updatedProject) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProject, "Project updated Successfully"));
});

const deleteProject = asynchandler(async(req,res)=>{
  const {projectId} = req.params

  const project = await Project.findById(projectId)

  if(!project){
    throw new ApiError(404,"No such project Exists")
  }

  // owner matches or not checking
  if(project.ownerid.toString()!==req.user._id.toString()){
    throw new ApiError(403,"Only owner of this project has access to delete")
  }

  // deleting screenshots from cloudinary
     for (const screenshot of project.screenshots) {
      await deletefromcloudinary(
        screenshot.public_id,
        screenshot.resource_type
      );
    }

    // deleting documents from cloudinary

    for (const document of project.documents) {
      await deletefromcloudinary(
        document.public_id,
        document.resource_type
      );
    }

    // deleting project from mongodb
    await project.deleteOne()

    // return 

    return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Project deleted Successfully"
      )  
    )
 

}) 

const getMyProjects = asynchandler(async(req,res)=>{
  const myProjects = await Project.find({
    ownerid : req.user._id
  })

  if(myProjects.length === 0)
  {
    throw new ApiError(404,"Loggined User has no projects")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      myProjects,
      "User projects Fetched"
    )
  )
})

const searchProjects = asynchandler(async(req,res)=>{
  const {
    title,
    technologies,
    category,
    tags,
    difficulty,
    ownername,
    status,
  } = req.query

  const filter = {}
  if(title){filter.title = {
    $regex :"title",
    $options :"i"
  }}
  if(technologies){filter.technologies =  {
    $regex :"technologies",
    $options: "i"
  }}
  if(category){filter.category = category}
  if(tags){filter.tags = tags}
  if(difficulty){filter.difficulty = difficulty}
  if(ownername){filter.ownername = ownername}
  if(status){filter.status = status}

  const projects = await Project.find(filter)
  if(projects.length ===0){
    throw new ApiError(404,"No such projects with given condition exists")
  }

  return res.status(200)
  .json(
      new ApiResponse(
        200,
        projects,
        "Projects matching with given conditions fetched"
    )
  )

})

export { 
  createProject, 
  getAllProjects ,
  getProjectById,
  updateProject,
  deleteProject,
  getMyProjects,
  searchProjects};
