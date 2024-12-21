import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { SalesController } from "../controllers/SalesController";
let controller = new SalesController()
const router = express.Router()

router.route("/salesman-visit").get(isAuthenticatedUser, controller.GetSalesManVisitReport)
router.route("/visit-reports").get(isAuthenticatedUser, controller.GetVisitReports)



export default router