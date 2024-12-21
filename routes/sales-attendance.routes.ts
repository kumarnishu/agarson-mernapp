import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { SalesController } from "../controllers/SalesController";
let controller = new SalesController()
const router = express.Router()

router.route("/salesman/kpi").get(isAuthenticatedUser, controller.GetSalesManKpi)
router.route("/attendances").get(isAuthenticatedUser, controller.GetSalesAttendances)
    .post(isAuthenticatedUser, controller.CreateSalesAttendance)
router.route("/attendances/:id").put(isAuthenticatedUser, controller.UpdateSalesAttendance)
    .delete(isAuthenticatedUser, controller.DeleteSalesAttendance)
router.route("/attendances/auto-reports").get(isAuthenticatedUser, controller.GetSalesAttendancesAutoReport)
router.route("/salesman-visit").get(isAuthenticatedUser, controller.GetSalesManVisitReport)
router.route("/visit-reports").get(isAuthenticatedUser, controller.GetVisitReports)

export default router