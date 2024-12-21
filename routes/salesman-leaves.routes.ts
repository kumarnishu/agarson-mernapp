import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { SalesController } from "../controllers/SalesController";
let controller = new SalesController()
const router = express.Router()

router.route("/salesman-leaves/report").get(isAuthenticatedUser, controller.GetSalesmanLeavesReport)
router.route("/create-salesman-leaves-from-excel").post(isAuthenticatedUser, upload.single('excel'), controller.CreateSalesmanLeavesFromExcel)
router.get("/download/template/salesmanleaves", isAuthenticatedUser, controller.DownloadExcelTemplateForCreateSalesmanLeavesReport)

export default router