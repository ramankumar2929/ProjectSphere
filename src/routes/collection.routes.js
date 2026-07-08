import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addProjectToCollection, createCollection, deleteCollection, getMyCollections, removeprojectfromcollection, updateCollection } from "../controllers/collection.controller.js";

const collectionRouter = Router()

collectionRouter.route("/createcollection").post(
    verifyJWT,
    createCollection
)

collectionRouter.route("/getMyCollections").get(
    verifyJWT,
    getMyCollections
) 

collectionRouter.route("/collection/:collectionId/project/:projectId").post(
    verifyJWT,
    addProjectToCollection
)

collectionRouter.route("/collection/:collectionId/project/:projectId").delete(
    verifyJWT,
    removeprojectfromcollection
)

collectionRouter.route("/update/:collectionId").post(
    verifyJWT,
    updateCollection
)
collectionRouter.route("/delete/:collectionId").delete(
    verifyJWT,
    deleteCollection
)

export {collectionRouter}