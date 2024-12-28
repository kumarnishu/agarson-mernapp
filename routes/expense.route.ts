import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { ExpenseController } from "../controllers/ExpenseController";

let controller = new ExpenseController()
const router = express.Router()

router.route("/issue-expense-items/:id").patch(isAuthenticatedUser, controller.IssueExpenseItem)
router.route("/add-expense-items/:id").patch(isAuthenticatedUser, controller.AddExpenseItem)
router.route("/expense-transactions").get(isAuthenticatedUser, controller.GetAllExpenseTransactions)
router.route("/expense-store").get(isAuthenticatedUser, controller.GetAllExpenseStore)



export default router
