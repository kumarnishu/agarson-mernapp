import express from "express";
import { upload } from ".";
import { test } from "../controllers/test";
const router = express.Router()

router.post("/test", upload.single("excel"), test)


export default router