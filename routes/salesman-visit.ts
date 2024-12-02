import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import {  GetSalesManVisitReport } from "../controllers/salesman-visit";
import { GetSalesAttendancesAutoReport, GetVisitReports } from "../controllers/visit-report";
const router = express.Router()

router.route("/salesman-visit").get(isAuthenticatedUser, GetSalesManVisitReport)
router.route("/visit-reports").get(isAuthenticatedUser, GetVisitReports)
router.route("/visit/auto-reports").get(isAuthenticatedUser, GetSalesAttendancesAutoReport)

export default router