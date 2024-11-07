import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { CreateSalesmanLeavesFromExcel, DownloadExcelTemplateForCreateSalesmanLeavesReport, GetSalesmanLeavesReport } from "../controllers/salesman-leaves";

const router = express.Router()

router.route("/salesman-leaves/report").get(isAuthenticatedUser, GetSalesmanLeavesReport)
router.route("/create-salesman-leaves-from-excel").post(isAuthenticatedUser, upload.single('excel'), CreateSalesmanLeavesFromExcel)
router.get("/download/template/salesmanleaves", isAuthenticatedUser, DownloadExcelTemplateForCreateSalesmanLeavesReport)

export default router