import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { BulkUploadMachine, CreateMachine, GetMachines, ToogleMachine, UpdateMachine } from "../controllers/production.controller";
import { upload } from ".";
const router = express.Router()

router.route("/machines").get(isAuthenticatedUser, GetMachines)
    .post(isAuthenticatedUser, CreateMachine)
router.put("/machines/:id", isAuthenticatedUser, UpdateMachine)
router.patch("/machines/toogle/:id", isAuthenticatedUser, ToogleMachine)
router.put("/machines/upload/bulk", isAuthenticatedUser, upload.single('file'), BulkUploadMachine)

export default router