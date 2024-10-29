import express from "express";
import multer from "multer";
const router = express.Router()

export const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 * 50 } })


router.use(ChecklistCategoryRoutes);
router.use(ChecklistRoutes);

export default router;

