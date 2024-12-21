import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { FeatureController } from "../controllers/FeaturesController";
let controller = new FeatureController()
const router = express.Router()

router.route("/productions/me").get(isAuthenticatedUser, controller.GetMyTodayProductions)
router.route("/productions").get(isAuthenticatedUser, controller.GetProductions)
    .post(isAuthenticatedUser, controller.CreateProduction)
router.route("/productions/:id").put(isAuthenticatedUser, controller.UpdateProduction)
    .delete(isAuthenticatedUser, controller.DeleteProduction)
    router.route("/production/categorywise").get(isAuthenticatedUser, controller.GetCategoryWiseProductionReports)
    router.route("/production/machinewise").get(isAuthenticatedUser, controller.GetMachineWiseProductionReports)
    router.route("/production/thekedarwise").get(isAuthenticatedUser, controller.GetThekedarWiseProductionReports)

export default router