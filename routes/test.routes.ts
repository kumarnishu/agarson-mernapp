import express from "express";
import { upload } from ".";
import { test } from "../controllers/test.controller";
import {  GetVisitReports } from "../controllers/visit-report.controller";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
const router = express.Router()

router.post("/test", upload.single("excel"), isAuthenticatedUser, test)
router.route("/test").get(isAuthenticatedUser, GetVisitReports)


export default router