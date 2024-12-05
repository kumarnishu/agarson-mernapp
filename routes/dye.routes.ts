import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from "./index.routes";
import { GetDyes, CreateDye, UpdateDye, GetDyeById, ToogleDye, BulkUploadDye, GetDyeForDropdown } from "../controllers/dye.controller";
const router = express.Router()

router.route("/dyes").get(isAuthenticatedUser, GetDyes)
    .post(isAuthenticatedUser, CreateDye)
router.route("/dropdown/dyes").get(isAuthenticatedUser, GetDyeForDropdown)
router.put("/dyes/:id", isAuthenticatedUser, UpdateDye)
router.get("/dyes/:id", isAuthenticatedUser, GetDyeById)
router.patch("/dyes/toogle/:id", isAuthenticatedUser, ToogleDye)
router.put("/dyes/upload/bulk", isAuthenticatedUser, upload.single('file'), BulkUploadDye)

export default router