import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { AssignKeyCategoriesToUsers, CreateKeyCategory, DeleteKeyCategory, GetAllKeyCategory, GetAllKeyCategoryForDropDown, UpdateKeyCategory } from "../controllers/key-category";

const router = express.Router()

router.route("/key-category").get(isAuthenticatedUser, GetAllKeyCategory).post(isAuthenticatedUser, CreateKeyCategory)
router.route("/key-category/:id").put(isAuthenticatedUser, UpdateKeyCategory).delete(isAuthenticatedUser, DeleteKeyCategory)
router.patch("/key-category/assign", isAuthenticatedUser, AssignKeyCategoriesToUsers)
router.route("/key-category/dropdown").get(isAuthenticatedUser, GetAllKeyCategoryForDropDown)

export default router
