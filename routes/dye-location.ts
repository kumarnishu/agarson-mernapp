import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { GetAllDyeLocations, CreateDyeLocation, UpdateDyeLocation, ToogleDyeLocation } from "../controllers/dye-location";
const router = express.Router()

router.route("/dye/locations").get(isAuthenticatedUser, GetAllDyeLocations).post(isAuthenticatedUser, CreateDyeLocation),
    router.route("/dye/locations/:id").put(isAuthenticatedUser, UpdateDyeLocation).patch(isAuthenticatedUser, ToogleDyeLocation)

export default router