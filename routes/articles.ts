import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { BulkUploadArticle, CreateArticle, GetArticles, ToogleArticle, UpdateArticle } from "../controllers/production.controller";
import { upload } from ".";
const router = express.Router()

router.route("/articles").get(isAuthenticatedUser, GetArticles)
    .post(isAuthenticatedUser, CreateArticle)
router.put("/articles/:id", isAuthenticatedUser, UpdateArticle)
router.patch("/articles/toogle/:id", isAuthenticatedUser, ToogleArticle)
router.put("/articles/upload/bulk", isAuthenticatedUser, upload.single('file'), BulkUploadArticle)

export default router