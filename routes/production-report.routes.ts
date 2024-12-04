import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { GetCategoryWiseProductionReports, GetMachineWiseProductionReports, GetThekedarWiseProductionReports } from "../controllers/production-report.controller";
const router = express.Router()

router.route("/production/categorywise").get(isAuthenticatedUser, GetCategoryWiseProductionReports)
router.route("/production/machinewise").get(isAuthenticatedUser, GetMachineWiseProductionReports)
router.route("/production/thekedarwise").get(isAuthenticatedUser, GetThekedarWiseProductionReports)

export default router