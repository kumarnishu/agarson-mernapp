import express from "express";
import { upload } from ".";
import { test } from "../controllers/test";
import {  GetVisitReports } from "../controllers/visit-report";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
const router = express.Router()

router.post("/test", upload.single("excel"), isAuthenticatedUser, test)
router.route("/test").get(isAuthenticatedUser, GetVisitReports)


export default router