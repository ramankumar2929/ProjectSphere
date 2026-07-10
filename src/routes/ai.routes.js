import { Router } from "express";
import { descriptionGenerator, projectAssistantChatbot, projectReviewGenerator, tagsGenerator } from "../controllers/ai.controller.js";

const aiRouter = Router()
 
aiRouter.route("/aiDescription").post(
    descriptionGenerator
)
aiRouter.route("/aiTags").post(
    tagsGenerator
)
aiRouter.route("/aiReview").post(
    projectReviewGenerator
)
aiRouter.route("/aiAssistant").post(
    projectAssistantChatbot
)

export {aiRouter}