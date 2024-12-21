import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { FeatureController } from "../controllers/FeaturesController";
let controller = new FeatureController()
const router = express.Router()

router.route("/production/categorywise").get(isAuthenticatedUser, controller.GetCategoryWiseProductionReports)
router.route("/production/machinewise").get(isAuthenticatedUser, controller.GetMachineWiseProductionReports)
router.route("/production/thekedarwise").get(isAuthenticatedUser, controller.GetThekedarWiseProductionReports)

export default router