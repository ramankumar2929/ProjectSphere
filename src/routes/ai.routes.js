import { Router } from "express";
import { testAI } from "../controllers/ai.controller.js";

const aiRouter = Router()

aiRouter.route("/test").post(
    testAI
)
export {aiRouter}