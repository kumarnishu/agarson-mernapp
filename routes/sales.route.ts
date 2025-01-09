import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { SalesController } from "../controllers/SalesController";
let controller = new SalesController()
const router = express.Router()

router.route("/references").get(isAuthenticatedUser, controller.GetReferencesReport)
router.route("/references/salesman").get(isAuthenticatedUser, controller.GetReferencesReportForSalesman)
router.post("/references/edit", isAuthenticatedUser, controller.EditReferenceState)
router.route("/create-references-from-excel").post(isAuthenticatedUser, upload.single('excel'), controller.BulkCreateAndUpdateReferenceFromExcel)
router.get("/download/template/references", isAuthenticatedUser, controller.DownloadExcelTemplateForCreateReferenceReport)

router.route("/sales").get(isAuthenticatedUser, controller.GetSalesReport)
router.route("/create-sales-from-excel").post(isAuthenticatedUser, upload.single('excel'), controller.BulkCreateAndUpdateSalesFromExcel)
router.get("/download/template/sales", isAuthenticatedUser, controller.DownloadExcelTemplateForCreateSalesReport)

router.route("/collections").get(isAuthenticatedUser, controller.GetCollectionReport)
router.route("/create-collections-from-excel").post(isAuthenticatedUser, upload.single('excel'), controller.BulkCreateAndUpdateCollectionsFromExcel)
router.get("/download/template/collections", isAuthenticatedUser, controller.DownloadExcelTemplateForCreateCollectionsReport)

router.route("/ageing").get(isAuthenticatedUser, controller.GetAgeingReport)
router.route("/ageing-remark").get(isAuthenticatedUser, controller.GetAgeingRemarkHistory).post(isAuthenticatedUser, controller.NewAgeingRemark)
router.route("/ageing-remark/:id").put(isAuthenticatedUser, controller.UpdateAgeingRemark).delete(isAuthenticatedUser, controller.DeleteAgeingRemark)
router.route("/create-ageing-from-excel").post(isAuthenticatedUser, upload.single('excel'), controller.BulkCreateAndUpdateAgeingFromExcel)
router.get("/download/template/ageing", isAuthenticatedUser, controller.DownloadExcelTemplateForCreateAgeingReport)
export default router
