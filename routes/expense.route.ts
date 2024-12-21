import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";

import { FeatureController } from "../controllers/FeaturesController";
let controller = new FeatureController()
const router = express.Router()

router.route("/issue-expense-items/:id").patch(isAuthenticatedUser, controller.IssueExpenseItem)
router.route("/add-expense-items/:id").patch(isAuthenticatedUser, controller.AddExpenseItem)
router.route("/expense-transactions").get(isAuthenticatedUser, controller.GetAllExpenseTransactions)
router.route("/expense-store").get(isAuthenticatedUser, controller.GetAllExpenseStore)



export default router
