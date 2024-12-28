import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { ProductionController } from "../controllers/ProductionController";
let controller = new ProductionController()
const router = express.Router()

router.patch("/sparedyes/validate/:id", isAuthenticatedUser, controller.ValidateSpareDye)
router.route("/sparedyes/me").get(isAuthenticatedUser, controller.GetMyTodaySpareDye),
    router.route("/sparedyes").get(isAuthenticatedUser, controller.GetSpareDyes).post(isAuthenticatedUser, upload.single('media'), controller.CreateSpareDye)
router.route("/sparedyes/:id").put(isAuthenticatedUser, upload.single('media'), controller.UpdateSpareDye).delete(isAuthenticatedUser, controller.DeleteSpareDye)

export default router