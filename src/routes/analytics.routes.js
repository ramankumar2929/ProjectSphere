import { Router } from "express";
import { getLatestProjects, getMostLikedProjects, getMostViewedProjects, getPlatformStats, getTrendingProjects } from "../controllers/analytics.controller.js";

const analyticsRouter = Router()

analyticsRouter.route("/mostViewedProjects").get(
    getMostViewedProjects
)

analyticsRouter.route("/mostLikedProjects").get(
    getMostLikedProjects
)

analyticsRouter.route("/latestProjects").get(
    getLatestProjects
)

analyticsRouter.route("/trendingProjects").get(
    getTrendingProjects
)

analyticsRouter.route("/platformStats").get(
    getPlatformStats
)


export {analyticsRouter}