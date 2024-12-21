import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { AuthorizationController } from "../controllers/AuthorizationController";
let controller = new AuthorizationController()
const router = express.Router()

router.patch("/key-category/assign", isAuthenticatedUser, controller.AssignKeyCategoriesToUsers)
router.route("/key-category/dropdown").get(isAuthenticatedUser, controller.GetAllKeyCategoryForDropDown)
router.route("/key-category").get(isAuthenticatedUser, controller.GetAllKeyCategory).post(isAuthenticatedUser, controller.CreateKeyCategory)
router.route("/key-category/:id").get(isAuthenticatedUser, controller.GetKeyCategoryById)
    .put(isAuthenticatedUser, controller.UpdateKeyCategory).delete(isAuthenticatedUser, controller.DeleteKeyCategory)

export default router

