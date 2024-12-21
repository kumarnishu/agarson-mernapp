import express from "express";
import { DropDownController } from "../controllers/DropDownController";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
let controller = new DropDownController()

const router = express.Router()

router.route("/payments/categories").get(isAuthenticatedUser, controller.GetAllPaymentCategory).post(isAuthenticatedUser, controller.CreatePaymentCategory)
router.route("/payments/categories/:id").put(isAuthenticatedUser, controller.UpdatePaymentCategory).delete(isAuthenticatedUser, controller.DeletePaymentCategory)

export default router