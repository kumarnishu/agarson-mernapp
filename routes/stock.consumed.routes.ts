import express from "express";
import { upload } from ".";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { StockSchemeController } from "../controllers/StockSchemeController";
let controller = new StockSchemeController()
const router = express.Router()

router.route("/consumed/stock").get(isAuthenticatedUser, controller.GetAllConsumedStockSchemes).post(isAuthenticatedUser, controller.ConsumeStockScheme)
router.route("/stock/schemes").get(isAuthenticatedUser, controller.GetAllStockSchemes).post(upload.single("excel"), isAuthenticatedUser, controller.CreateStockSchemeFromExcel)
router.get("/download/template/stock-schme", isAuthenticatedUser, controller.DownloadExcelTemplateForCreateStockScheme)

export default router