import express from "express";
import { isAuthenticatedUser, isProfileAuthenticated } from "../middlewares/auth.middleware";
import { AssignUsers, GetProfile, GetUsers, NewUser, SignUp, UpdateProfile, UpdateUser } from "../controllers/user";
import { upload } from ".";
const router = express.Router()

router.post("/signup", upload.single("dp"), SignUp)
router.route("/users").get(isAuthenticatedUser, GetUsers)
    .post(isAuthenticatedUser, upload.single("dp"), NewUser)
router.route("/users/:id")
    .put(isAuthenticatedUser, upload.single("dp"), UpdateUser)
router.patch("/assign/users/:id", isAuthenticatedUser, AssignUsers)
router.route("/profile")
    .get(isProfileAuthenticated, GetProfile)
    .put(isAuthenticatedUser, upload.single("dp"), UpdateProfile)




export default router