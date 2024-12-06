import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { AssignKeysToUsers, CreateKey, CreateKeysFromExcel, DeleteKey, DownloadExcelTemplateForCreateKeys, GetAllKey, UpdateKey } from "../controllers/keys.controller";
import { upload } from ".";

const router = express.Router()

router.route("/keys").get(isAuthenticatedUser, GetAllKey).post(isAuthenticatedUser, CreateKey)
router.route("/keys/:id").put(isAuthenticatedUser, UpdateKey).delete(isAuthenticatedUser, DeleteKey)
router.patch("/keys/assign", isAuthenticatedUser, AssignKeysToUsers)
router.route("/create-from-excel/keys")
    .put(isAuthenticatedUser, upload.single("excel"), CreateKeysFromExcel)
router.get("/download/template/keys", isAuthenticatedUser, DownloadExcelTemplateForCreateKeys)
export default router

