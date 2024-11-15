import express from "express";
import { upload } from ".";
import { test } from "../controllers/test";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
const router = express.Router()

router.post("/test", upload.single("excel"), isAuthenticatedUser,test)


export default router