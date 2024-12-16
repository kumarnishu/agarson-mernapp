import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { BulkCreateAndUpdateReferenceFromExcel, DownloadExcelTemplateForCreateReferenceReport, GetReferencesReport, GetReferencesReportForSalesman } from "../controllers/references.controller";

const router = express.Router()

router.route("/references").get(isAuthenticatedUser, GetReferencesReport)
router.route("/references/salesman").get(isAuthenticatedUser, GetReferencesReportForSalesman)
router.route("/create-references-from-excel").post(isAuthenticatedUser, upload.single('excel'), BulkCreateAndUpdateReferenceFromExcel)
router.get("/download/template/references", isAuthenticatedUser, DownloadExcelTemplateForCreateReferenceReport)

export default router