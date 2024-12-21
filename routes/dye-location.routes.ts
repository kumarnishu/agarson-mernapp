import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { DropDownController } from "../controllers/DropDownController";
let controller = new DropDownController()
const router = express.Router()

router.route("/dye/locations").get(isAuthenticatedUser, controller.GetAllDyeLocations)
    .post(isAuthenticatedUser, controller.CreateDyeLocation),
    router.route("/dropdown/dye/locations").get(isAuthenticatedUser, controller.GetAllDyeLocationsForDropdown)
router.route("/dye/locations/:id").put(isAuthenticatedUser, controller.UpdateDyeLocation).patch(isAuthenticatedUser, controller.ToogleDyeLocation)

export default router