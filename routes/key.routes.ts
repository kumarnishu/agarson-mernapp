import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";

import { AuthorizationController } from "../controllers/AuthorizationController";
let controller = new AuthorizationController()
const router = express.Router()

router.route("/keys").get(isAuthenticatedUser, controller.GetAllKey).post(isAuthenticatedUser, controller.CreateKey)
router.route("/keys/:id").put(isAuthenticatedUser, controller.UpdateKey).delete(isAuthenticatedUser, controller.DeleteKey)
router.patch("/keys/assign", isAuthenticatedUser, controller.AssignKeysToUsers)
router.route("/create-from-excel/keys")
    .put(isAuthenticatedUser, upload.single("excel"), controller.CreateKeysFromExcel)
router.get("/download/template/keys", isAuthenticatedUser, controller.DownloadExcelTemplateForCreateKeys)
export default router

