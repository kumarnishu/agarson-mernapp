import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { AssignKeysToUsers, CreateKey, DeleteKey, GetAllKey, UpdateKey } from "../controllers/keys";

const router = express.Router()

router.route("/keys").get(isAuthenticatedUser, GetAllKey).post(isAuthenticatedUser, CreateKey)
router.route("/keys/:id").put(isAuthenticatedUser, UpdateKey).delete(isAuthenticatedUser, DeleteKey)
router.patch("/keys/assign", isAuthenticatedUser, AssignKeysToUsers)

export default router

