import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { DropDownController } from "../controllers/DropDownController";
let controller = new DropDownController()
const router = express.Router()

router.route("/machine/categories").get(isAuthenticatedUser, controller.GetMachineCategories).post(isAuthenticatedUser, controller.CreateMachineCategory)
router.route("/machine/categories/:id").put(isAuthenticatedUser, controller.UpdateMachineCategory).delete(isAuthenticatedUser, controller.DeleteMachineCategory)

export default router