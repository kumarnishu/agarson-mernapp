import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { CreateMachineCategory, DeleteMachineCategory, GetMachineCategories, UpdateMachineCategory } from "../controllers/production.controller";
const router = express.Router()

router.route("/machine/categories").get(isAuthenticatedUser, GetMachineCategories).post(isAuthenticatedUser, CreateMachineCategory)
router.route("/machine/categories/:id").put(isAuthenticatedUser, UpdateMachineCategory).delete(isAuthenticatedUser, DeleteMachineCategory)

export default router