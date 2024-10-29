import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { GetActivitiesTopBarDetails, GetAssignedRefers, GetMyReminders, GetNewRefers } from "../controllers/lead.controller";
const router = express.Router()

router.route("/assigned/refers/report").get(isAuthenticatedUser, GetAssignedRefers)
router.route("/new/refers/report").get(isAuthenticatedUser, GetNewRefers)
router.get("/activities/topbar", isAuthenticatedUser, GetActivitiesTopBarDetails)
router.route("/reminders").get(isAuthenticatedUser, GetMyReminders)

export default router