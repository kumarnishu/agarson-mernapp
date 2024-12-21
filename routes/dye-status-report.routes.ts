import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { FeatureController } from "../controllers/FeaturesController";
let controller = new FeatureController()
const router = express.Router()

router.route("/dyestatus/report").get(isAuthenticatedUser,controller. GetDyeStatusReport)

export default router