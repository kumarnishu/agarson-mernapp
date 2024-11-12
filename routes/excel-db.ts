import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { CreateExcelDBFromExcel, GetExcelDbReport } from "../controllers/excel-db";


const router = express.Router()

router.route("/excel-db").get(isAuthenticatedUser, GetExcelDbReport)
router.route("/excel-db").post(isAuthenticatedUser, upload.single('excel'), CreateExcelDBFromExcel)

export default router