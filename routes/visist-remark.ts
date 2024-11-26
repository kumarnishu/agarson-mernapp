import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { DeleteVisitRemark, GetVisitSummaryReportRemarkHistory, NewVisitRemark, UpdateVisitRemark } from "../controllers/visit-remark";
const router = express.Router()

router.route("/visit/remarks").post(isAuthenticatedUser, NewVisitRemark)
router.route("/visit/remarks/:id").get(isAuthenticatedUser, GetVisitSummaryReportRemarkHistory)
    .put(isAuthenticatedUser, UpdateVisitRemark)
    .delete(isAuthenticatedUser, DeleteVisitRemark)

export default router