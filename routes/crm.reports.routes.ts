import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { FeatureController } from "../controllers/FeaturesController";
let controller = new FeatureController()
const router = express.Router()

router.route("/assigned/refers/report").get(isAuthenticatedUser, controller.GetAssignedRefers)
router.route("/new/refers/report").get(isAuthenticatedUser, controller.GetNewRefers)
router.get("/activities/topbar", isAuthenticatedUser, controller.GetActivitiesTopBarDetails)
router.route("/reminders").get(isAuthenticatedUser, controller.GetMyReminders)

export default router