import express from "express";
import { SendPasswordResetMail, SendVerifyEmail } from "../controllers/user.controller";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
const router = express.Router()

router.post("/email/verify", isAuthenticatedUser, SendVerifyEmail)

router.post("/password/reset", SendPasswordResetMail)

export default router