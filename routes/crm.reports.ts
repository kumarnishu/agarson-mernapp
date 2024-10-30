import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { GetActivitiesTopBarDetails } from "../controllers/crm-remarks";
import { GetAssignedRefers, GetNewRefers, GetMyReminders } from "../controllers/crm.reports";
const router = express.Router()

router.route("/assigned/refers/report").get(isAuthenticatedUser, GetAssignedRefers)
router.route("/new/refers/report").get(isAuthenticatedUser, GetNewRefers)
router.get("/activities/topbar", isAuthenticatedUser, GetActivitiesTopBarDetails)
router.route("/reminders").get(isAuthenticatedUser, GetMyReminders)

export default router