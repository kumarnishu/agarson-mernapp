import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { GetAllChecklistCategory, CreateChecklistCategory, UpdateChecklistCategory, DeleteChecklistCategory } from "../controllers/checklist-category";

const router = express.Router()


router.route("/checklists/categories").get(isAuthenticatedUser, GetAllChecklistCategory).post(isAuthenticatedUser, CreateChecklistCategory)
router.route("/checklists/categories/:id").put(isAuthenticatedUser, UpdateChecklistCategory).delete(isAuthenticatedUser, DeleteChecklistCategory)




export default router