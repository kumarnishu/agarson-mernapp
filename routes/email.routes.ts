import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { UserController } from "../controllers/UserController";
let controller = new UserController()
const router = express.Router()

router.post("/email/verify", isAuthenticatedUser, controller.SendVerifyEmail)

router.post("/password/reset", controller.SendPasswordResetMail)

export default router