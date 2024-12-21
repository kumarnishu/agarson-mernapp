import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { SalesController } from "../controllers/SalesController";
let controller = new SalesController()
const router = express.Router()

router.route("/references").get(isAuthenticatedUser, controller.GetReferencesReport)
router.route("/references/salesman").get(isAuthenticatedUser, controller.GetReferencesReportForSalesman)
router.route("/create-references-from-excel").post(isAuthenticatedUser, upload.single('excel'), controller.BulkCreateAndUpdateReferenceFromExcel)
router.get("/download/template/references", isAuthenticatedUser, controller.DownloadExcelTemplateForCreateReferenceReport)

export default router
