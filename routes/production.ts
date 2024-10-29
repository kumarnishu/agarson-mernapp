import express from "express";
import { CreateProduction, DeleteProduction, GetMyTodayProductions, GetProductions, UpdateProduction } from "../controllers/production.controller";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
const router = express.Router()

router.route("/productions/me").get(isAuthenticatedUser, GetMyTodayProductions)
router.route("/productions").get(isAuthenticatedUser, GetProductions)
    .post(isAuthenticatedUser, CreateProduction)
router.route("/productions/:id").put(isAuthenticatedUser, UpdateProduction)
    .delete(isAuthenticatedUser, DeleteProduction)


export default router