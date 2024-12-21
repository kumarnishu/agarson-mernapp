import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { DropDownController } from "../controllers/DropDownController";
let controller = new DropDownController()
const router = express.Router()

router.route("/articles").get(isAuthenticatedUser, controller.GetArticles)
    .post(isAuthenticatedUser, controller.CreateArticle)
router.route("/dropdown/articles").get(isAuthenticatedUser, controller.GetArticlesForDropdown)
router.put("/articles/:id", isAuthenticatedUser, controller.UpdateArticle)
router.patch("/articles/toogle/:id", isAuthenticatedUser, controller.ToogleArticle)
router.put("/articles/upload/bulk", isAuthenticatedUser, upload.single('file'), controller.BulkUploadArticle)

export default router