import express from "express";
import { isAuthenticatedUser, isProfileAuthenticated } from "../middlewares/auth.middleware";
import { upload } from ".";
import { FeatureController } from "../controllers/FeaturesController";
import { UserController } from "../controllers/UserController";
let controller = new UserController()


const router = express.Router()

router.post("/signup", upload.single("dp"), controller.SignUp)
router.route("/users").get(isAuthenticatedUser, controller.GetUsers)
    .post(isAuthenticatedUser, upload.single("dp"), controller.NewUser)
router.route("/users/assignment").get(isAuthenticatedUser, controller.GetUsersForAssignmentPage)
router.route("/users/dropdown").get(isAuthenticatedUser, controller.GetUsersForDropdown)

router.route("/users/:id")
    .put(isAuthenticatedUser, upload.single("dp"), controller.UpdateUser)
router.patch("/assign/users/:id", isAuthenticatedUser, controller.AssignUsers)
router.route("/profile")
    .get(isProfileAuthenticated, controller.GetProfile)
    .put(isAuthenticatedUser, upload.single("dp"), controller.UpdateProfile)




export default router