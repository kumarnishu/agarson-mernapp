import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { GetPayments, CreatePayment,  EditPayment, DeletePayment, CreatePaymentFromExcel, DownloadExcelTemplateForCreatePayments, ChangeNextDate, AssignPaymentsToUsers, GetMobilePayments, BulkDeletePayments, GetPaymentsTopBarDetails, ChangeDueDate } from "../controllers/payment";

const router = express.Router()

router.route("/payments").get(isAuthenticatedUser, GetPayments).post(isAuthenticatedUser, upload.single('photo'), CreatePayment)
router.route("/payments/me").get(isAuthenticatedUser, GetMobilePayments)
router.route("/payments/:id").put(isAuthenticatedUser, EditPayment)
router.route("/payments/:id").delete(isAuthenticatedUser, DeletePayment)
router.route("/payments/nextdate/:id").patch(isAuthenticatedUser, ChangeNextDate)
router.route("/payments/duedate/:id").patch(isAuthenticatedUser, ChangeDueDate)
router.route("/create-from-excel/payments")
    .put(isAuthenticatedUser, upload.single("excel"), CreatePaymentFromExcel)
router.get("/download/template/payments", isAuthenticatedUser, DownloadExcelTemplateForCreatePayments)
router.route("/assign/payments/").post(isAuthenticatedUser, AssignPaymentsToUsers)
router.route("/bulk/delete/payments").post(isAuthenticatedUser, BulkDeletePayments)
router.route("/payments/topbar-details").get(isAuthenticatedUser, GetPaymentsTopBarDetails)

export default router