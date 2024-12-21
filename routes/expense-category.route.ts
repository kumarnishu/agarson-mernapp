import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { CreateExpenseCategory, DeleteExpenseCategory, GetAllExpenseCategory, UpdateExpenseCategory } from "../controllers/expense-category.controller";
import { FeatureController } from "../controllers/FeaturesController";
let controller = new FeatureController()
const router = express.Router()

router.route("/expense/categories").get(isAuthenticatedUser, GetAllExpenseCategory).post(isAuthenticatedUser, CreateExpenseCategory),
    router.route("/expense/categories/:id").put(isAuthenticatedUser, UpdateExpenseCategory).delete(isAuthenticatedUser, DeleteExpenseCategory)


export default router
