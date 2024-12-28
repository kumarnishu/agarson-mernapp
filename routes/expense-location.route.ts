import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { DropDownController } from "../controllers/DropDownController";
let controller = new DropDownController()
const router = express.Router()

router.route("/expense/locations").get(isAuthenticatedUser, controller.GetAllExpenseLocation).post(isAuthenticatedUser, controller.CreateExpenseLocation),
router.route("/expense/locations/:id").put(isAuthenticatedUser,controller. UpdateExpenseLocation).delete(isAuthenticatedUser, controller.DeleteExpenseLocation)


export default router
