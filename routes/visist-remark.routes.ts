import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { SalesController } from "../controllers/SalesController";
let controller = new SalesController()
const router = express.Router()

router.route("/visit/remarks").post(isAuthenticatedUser, controller.NewVisitRemark)
router.route("/visit/remarks/:id")
    .put(isAuthenticatedUser, controller.UpdateVisitRemark)
    .delete(isAuthenticatedUser, controller.DeleteVisitRemark)
router.route("/visit/remarks").get(isAuthenticatedUser, controller.GetVisitSummaryReportRemarkHistory)

export default router