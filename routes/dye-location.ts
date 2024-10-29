import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { CreateDyeLocation, GetAllDyeLocations, ToogleDyeLocation, UpdateDyeLocation } from "../controllers/production.controller";
const router = express.Router()

router.route("/dye/locations").get(isAuthenticatedUser, GetAllDyeLocations).post(isAuthenticatedUser, CreateDyeLocation),
    router.route("/dye/locations/:id").put(isAuthenticatedUser, UpdateDyeLocation).patch(isAuthenticatedUser, ToogleDyeLocation)

export default router