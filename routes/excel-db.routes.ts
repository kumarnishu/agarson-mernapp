import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";

import { ExcelReportController } from "../controllers/ExcelReportController";
let controller = new ExcelReportController()
const router = express.Router()

router.route("/excel-db").get(isAuthenticatedUser, controller.GetExcelDbReport)
router.route("/excel-db").post(isAuthenticatedUser, upload.single('excel'), controller.CreateExcelDBFromExcel)

export default router