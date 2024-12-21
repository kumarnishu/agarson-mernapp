import express from "express";
import { upload } from ".";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { TestController } from "../controllers/TestController";
let controller = new TestController()
const router = express.Router()

router.post("/test", upload.single("excel"), isAuthenticatedUser, controller.test)


export default router