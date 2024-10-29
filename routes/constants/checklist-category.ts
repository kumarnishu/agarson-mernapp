import express from "express";
import { isAuthenticatedUser } from "../../middlewares/auth.middleware";
import { CreateChecklistCategory, DeleteChecklistCategory, GetAllChecklistCategory, UpdateChecklistCategory } from "../../controllers/checklist.controller";

const router = express.Router()


router.route("/checklists/categories").get(isAuthenticatedUser, GetAllChecklistCategory).post(isAuthenticatedUser, CreateChecklistCategory)
router.route("/checklists/categories/:id").put(isAuthenticatedUser, UpdateChecklistCategory).delete(isAuthenticatedUser, DeleteChecklistCategory)




export default router