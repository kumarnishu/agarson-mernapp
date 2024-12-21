import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { FeatureController } from "../controllers/FeaturesController";
import { DropDownController } from "../controllers/DropDownController";
let controller = new DropDownController()
const router = express.Router()

router.route("/item/unit").get(isAuthenticatedUser, controller.GetAllItemUnit).post(isAuthenticatedUser, controller.CreateItemUnit),
    router.route("/item/unit/:id").put(isAuthenticatedUser, controller.UpdateItemUnit).delete(isAuthenticatedUser, controller.DeleteItemUnit)


export default router
