import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { FeatureController } from "../controllers/FeaturesController";
let controller = new FeatureController()
const router = express.Router()

router.route("/shoeweight/diffreports").get(isAuthenticatedUser, controller.GetShoeWeightDifferenceReports)

export default router