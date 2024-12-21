import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { ExcelReportController } from "../controllers/ExcelReportController";
let controller = new ExcelReportController()
const router = express.Router()

router.route("/excel-db/remarks").post(isAuthenticatedUser, controller.NewExcelDBRemark)
router.route("/excel-db/remarks/:id").get(isAuthenticatedUser, controller.GetExcelDBRemarkHistory)
router.route("/excel-db/remarks/:id").put(isAuthenticatedUser, controller.UpdateExcelDBRemark)
router.route("/excel-db/remarks/:id").delete(isAuthenticatedUser, controller.DeleteExcelDBRemark)


export default router