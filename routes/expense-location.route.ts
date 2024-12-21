import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { CreateExpenseLocation, DeleteExpenseLocation, GetAllExpenseLocation, UpdateExpenseLocation } from "../controllers/expense-location.controller";
import { FeatureController } from "../controllers/FeaturesController";
let controller = new FeatureController()
const router = express.Router()

router.route("/expense/locations").get(isAuthenticatedUser, GetAllExpenseLocation).post(isAuthenticatedUser, CreateExpenseLocation),
router.route("/expense/locations/:id").put(isAuthenticatedUser, UpdateExpenseLocation).delete(isAuthenticatedUser, DeleteExpenseLocation)


export default router
