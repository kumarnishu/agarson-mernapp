import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { DeleteVisitRemark, GetVisitSummaryReportRemarkHistory, NewVisitRemark, UpdateVisitRemark } from "../controllers/visit-remark.controller";
const router = express.Router()

router.route("/visit/remarks").post(isAuthenticatedUser, NewVisitRemark)
router.route("/visit/remarks/:id")
    .put(isAuthenticatedUser, UpdateVisitRemark)
    .delete(isAuthenticatedUser, DeleteVisitRemark)
router.route("/visit/remarks").get(isAuthenticatedUser, GetVisitSummaryReportRemarkHistory)

export default router