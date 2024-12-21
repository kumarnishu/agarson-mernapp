import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { AssignKeyCategoriesToUsers, CreateKeyCategory, DeleteKeyCategory, GetAllKeyCategory, GetAllKeyCategoryForDropDown, GetKeyCategoryById, UpdateKeyCategory } from "../controllers/key-category.controller";

import { FeatureController } from "../controllers/FeaturesController";
let controller = new FeatureController()
const router = express.Router()

router.patch("/key-category/assign", isAuthenticatedUser, AssignKeyCategoriesToUsers)
router.route("/key-category/dropdown").get(isAuthenticatedUser, GetAllKeyCategoryForDropDown)
router.route("/key-category").get(isAuthenticatedUser, GetAllKeyCategory).post(isAuthenticatedUser, CreateKeyCategory)
router.route("/key-category/:id").get(isAuthenticatedUser, GetKeyCategoryById)
    .put(isAuthenticatedUser, UpdateKeyCategory).delete(isAuthenticatedUser, DeleteKeyCategory)

export default router

