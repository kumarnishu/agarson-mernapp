import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { FeatureController } from "../controllers/FeaturesController";
import { DropDownController } from "../controllers/DropDownController";
let controller = new DropDownController()

const router = express.Router()

router.route("/expense/categories").get(isAuthenticatedUser,controller. GetAllExpenseCategory).post(isAuthenticatedUser, controller.CreateExpenseCategory),
    router.route("/expense/categories/:id").put(isAuthenticatedUser,controller. UpdateExpenseCategory).delete(isAuthenticatedUser,controller. DeleteExpenseCategory)


export default router
