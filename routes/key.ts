import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { CreateKey, DeleteKey, GetAllKey, UpdateKey } from "../controllers/keys";

const router = express.Router()

router.route("/keys").get(isAuthenticatedUser, GetAllKey).post(isAuthenticatedUser, CreateKey)
router.route("/keys/:id").put(isAuthenticatedUser, UpdateKey).delete(isAuthenticatedUser, DeleteKey)


export default router

