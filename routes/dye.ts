import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { BulkUploadDye, CreateDye, GetDyeById, GetDyes, ToogleDye, UpdateDye } from "../controllers/production.controller";
import { upload } from ".";
const router = express.Router()

router.route("/dyes").get(isAuthenticatedUser, GetDyes)
    .post(isAuthenticatedUser, CreateDye)
router.put("/dyes/:id", isAuthenticatedUser, UpdateDye)
router.get("/dyes/:id", isAuthenticatedUser, GetDyeById)
router.patch("/dyes/toogle/:id", isAuthenticatedUser, ToogleDye)
router.put("/dyes/upload/bulk", isAuthenticatedUser, upload.single('file'), BulkUploadDye)

export default router