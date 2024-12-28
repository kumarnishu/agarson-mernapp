import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { PaymentController } from "../controllers/PaymentsController";
let controller = new PaymentController()
const router = express.Router()

router.route("/payments").get(isAuthenticatedUser, controller.GetPayments).post(isAuthenticatedUser, upload.single('photo'),controller.CreatePayment)
router.route("/payments/me").get(isAuthenticatedUser, controller.GetMobilePayments)
router.route("/payments/:id").put(isAuthenticatedUser, controller.EditPayment)
router.route("/payments/:id").delete(isAuthenticatedUser, controller.DeletePayment)
router.route("/payments/nextdate/:id").patch(isAuthenticatedUser, controller.ChangeNextPaymentDate)
router.route("/payments/duedate/:id").patch(isAuthenticatedUser, controller.ChangeDueDate)
router.route("/create-from-excel/payments")
    .put(isAuthenticatedUser, upload.single("excel"), controller.CreatePaymentFromExcel)
router.get("/download/template/payments", isAuthenticatedUser, controller.DownloadExcelTemplateForCreatePayments)
router.route("/assign/payments/").post(isAuthenticatedUser, controller.AssignPaymentsToUsers)
router.route("/bulk/delete/payments").post(isAuthenticatedUser, controller.BulkDeletePayments)
router.route("/payments/topbar-details").get(isAuthenticatedUser, controller.GetPaymentsTopBarDetails)

export default router