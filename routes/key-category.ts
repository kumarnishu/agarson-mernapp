import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { CreateKeyCategory, DeleteKeyCategory, GetAllKeyCategory, UpdateKeyCategory } from "../controllers/key-category";

const router = express.Router()

router.route("/key-category").get(isAuthenticatedUser, GetAllKeyCategory).post(isAuthenticatedUser, CreateKeyCategory)
router.route("/key-category/:id").put(isAuthenticatedUser, UpdateKeyCategory).delete(isAuthenticatedUser, DeleteKeyCategory)


export default router

