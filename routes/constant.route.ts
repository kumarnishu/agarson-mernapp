import express from "express";
const router = express.Router()
import ChecklistCategoryRoutes from "./constants/checklist-category"
import ChecklistRoutes from "./features/checklist";

router.use(ChecklistCategoryRoutes);
router.use(ChecklistRoutes);

export default router;

