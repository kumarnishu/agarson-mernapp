import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { DropDownController } from "../controllers/DropDownController";
let controller = new DropDownController()
const router = express.Router()

router.route("/checklists/categories").get(isAuthenticatedUser, controller.GetAllChecklistCategory).post(isAuthenticatedUser, controller.CreateChecklistCategory)
router.route("/checklists/categories/:id").put(isAuthenticatedUser, controller.UpdateChecklistCategory).delete(isAuthenticatedUser, controller.DeleteChecklistCategory)


export default router

