import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { CreateItemUnit, DeleteItemUnit, GetAllItemUnit, UpdateItemUnit } from "../controllers/itemunit.controller";
import { FeatureController } from "../controllers/FeaturesController";
let controller = new FeatureController()
const router = express.Router()

router.route("/item/unit").get(isAuthenticatedUser, GetAllItemUnit).post(isAuthenticatedUser, CreateItemUnit),
router.route("/item/unit/:id").put(isAuthenticatedUser, UpdateItemUnit).delete(isAuthenticatedUser, DeleteItemUnit)


export default router
