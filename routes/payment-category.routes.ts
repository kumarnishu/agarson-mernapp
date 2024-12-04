import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { GetAllPaymentCategory, CreatePaymentCategory, UpdatePaymentCategory, DeletePaymentCategory } from "../controllers/payment-category.controller";

const router = express.Router()

router.route("/payments/categories").get(isAuthenticatedUser, GetAllPaymentCategory).post(isAuthenticatedUser, CreatePaymentCategory)
router.route("/payments/categories/:id").put(isAuthenticatedUser, UpdatePaymentCategory).delete(isAuthenticatedUser, DeletePaymentCategory)

export default router