import express from "express";
const router = express.Router()
import ChecklistRoutes from "./features/checklist";

router.use(ChecklistRoutes);

export default router;

