import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { ProductionController } from "../controllers/ProductionController";
let controller = new ProductionController()

const router = express.Router()

router.route("/weights/me").get(isAuthenticatedUser, controller.GetMyTodayShoeWeights),
    router.route("/weights").get(isAuthenticatedUser, controller.GetShoeWeights)
        .post(isAuthenticatedUser, upload.single('media'), controller.CreateShoeWeight)
router.route("/weights/:id").put(isAuthenticatedUser, upload.single('media'), controller.UpdateShoeWeight1).delete(isAuthenticatedUser, controller.DeleteShoeWeight),
    router.put("/weights2/:id", isAuthenticatedUser, upload.single('media'), controller.UpdateShoeWeight2),
    router.put("/weights3/:id", isAuthenticatedUser, upload.single('media'), controller.UpdateShoeWeight3),
    router.patch("/weights/validate/:id", isAuthenticatedUser, controller.ValidateShoeWeight)
    router.route("/shoeweight/diffreports").get(isAuthenticatedUser, controller.GetShoeWeightDifferenceReports)
export default router