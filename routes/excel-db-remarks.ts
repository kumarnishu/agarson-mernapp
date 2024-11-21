import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { DeleteExcelDBRemark, GetExcelDBRemarkHistory, NewExcelDBRemark, UpdateExcelDBRemark } from "../controllers/exceldb-remark";
const router = express.Router()

router.route("/excel-db/remarks").post(isAuthenticatedUser, NewExcelDBRemark)
router.route("/excel-db/remarks/:id").get(isAuthenticatedUser, GetExcelDBRemarkHistory)
router.route("/excel-db/remarks/:id").put(isAuthenticatedUser, UpdateExcelDBRemark)
router.route("/excel-db/remarks/:id").delete(isAuthenticatedUser, DeleteExcelDBRemark)


export default router