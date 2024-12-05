import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from "./index.routes";
import { GetArticles, CreateArticle, UpdateArticle, ToogleArticle, BulkUploadArticle, GetArticlesForDropdown } from "../controllers/articles.controller";
const router = express.Router()

router.route("/articles").get(isAuthenticatedUser, GetArticles)
    .post(isAuthenticatedUser, CreateArticle)
router.route("/dropdown/articles").get(isAuthenticatedUser, GetArticlesForDropdown)
router.put("/articles/:id", isAuthenticatedUser, UpdateArticle)
router.patch("/articles/toogle/:id", isAuthenticatedUser, ToogleArticle)
router.put("/articles/upload/bulk", isAuthenticatedUser, upload.single('file'), BulkUploadArticle)

export default router