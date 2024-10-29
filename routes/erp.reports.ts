import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { BulkCreateBillsAgingReportFromExcel, BulkCreateClientSaleReportFromExcel, BulkCreateClientSaleReportFromExcelForLastYear, BulkCreatePartyTargetReportFromExcel,  BulkCreateVisitReportFromExcel,  BulkPendingOrderReportFromExcel, GetBillsAgingReports, GetClientSaleReports, GetClientSaleReportsForLastYear, GetPartyTargetReports, GetPendingOrderReports, GetSaleAnalysisReport, GetVisitReports } from "../controllers/erp.controller";
import { upload } from ".";

const router = express.Router()

router.route("/reports/pending/orders").get(isAuthenticatedUser, GetPendingOrderReports)
router.route("/reports/pending/orders").put(isAuthenticatedUser, upload.single('file'), BulkPendingOrderReportFromExcel)
router.route("/reports/partytarget").get(isAuthenticatedUser, GetPartyTargetReports)
router.route("/reports/saleanalysis/:month").get(isAuthenticatedUser, GetSaleAnalysisReport)
router.route("/reports/partytarget").put(isAuthenticatedUser, upload.single('file'), BulkCreatePartyTargetReportFromExcel)
router.route("/reports/bills/aging").get(isAuthenticatedUser, GetBillsAgingReports)
router.route("/reports/bills/aging").put(isAuthenticatedUser, upload.single('file'), BulkCreateBillsAgingReportFromExcel)
router.route("/reports/client/sale").get(isAuthenticatedUser, GetClientSaleReports)
router.route("/reports/client/sale/lastyear").get(isAuthenticatedUser, GetClientSaleReportsForLastYear)
router.route("/reports/client/sale").put(isAuthenticatedUser, upload.single('file'), BulkCreateClientSaleReportFromExcel),
router.route("/reports/client/sale/lastyear").put(isAuthenticatedUser, upload.single('file'), BulkCreateClientSaleReportFromExcelForLastYear)
router.route("/reports/visits").get(isAuthenticatedUser, GetVisitReports)
router.route("/reports/visits").put(isAuthenticatedUser, upload.single('file'), BulkCreateVisitReportFromExcel)


export default router