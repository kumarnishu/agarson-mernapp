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


export default router