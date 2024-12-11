import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { AddExpenseItem, GetAllExpenseStore, GetAllExpenseTransactions, IssueExpenseItem } from "../controllers/expense.controller";

const router = express.Router()

router.route("/issue-expense-items/:id").patch(isAuthenticatedUser, IssueExpenseItem)
router.route("/add-expense-items/:id").patch(isAuthenticatedUser, AddExpenseItem)
router.route("/expense-transactions").get(isAuthenticatedUser, GetAllExpenseTransactions)
router.route("/expense-store").get(isAuthenticatedUser, GetAllExpenseStore)



export default router
