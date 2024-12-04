import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { SendVerifyEmail, SendPasswordResetMail } from "../controllers/email.controller";
const router = express.Router()

router.post("/email/verify", isAuthenticatedUser, SendVerifyEmail)

router.post("/password/reset", SendPasswordResetMail)

export default router