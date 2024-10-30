import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { GetChecklists, CreateChecklist, ToogleChecklist, EditChecklist, DeleteChecklist, CreateChecklistFromExcel, DownloadExcelTemplateForCreatechecklists } from "../controllers/checklist";

const router = express.Router()

router.route("/checklists").get(isAuthenticatedUser, GetChecklists).post(isAuthenticatedUser, upload.single('photo'), CreateChecklist)
router.route("/checklists/toogle/:id").patch(isAuthenticatedUser, ToogleChecklist)
router.route("/checklists/:id").put(isAuthenticatedUser, upload.single('photo'), EditChecklist)
router.route("/checklists/:id").delete(isAuthenticatedUser, DeleteChecklist)
router.route("/create-from-excel/checklists")
    .post(isAuthenticatedUser, upload.single("excel"), CreateChecklistFromExcel)
router.get("/download/template/checklists", isAuthenticatedUser, DownloadExcelTemplateForCreatechecklists)

export default router