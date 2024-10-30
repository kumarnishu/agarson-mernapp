import { NextFunction, Request, Response } from 'express';
import { CreateOrEditArticleDto, GetArticleDto } from '../dtos';
import { Article, IArticle } from '../models/article';
import moment from 'moment';
import xlsx from "xlsx";

export const GetArticles = async (req: Request, res: Response, next: NextFunction) => {
    let hidden = String(req.query.hidden)
    let result: GetArticleDto[] = []
    let articles: IArticle[] = []
    if (hidden === "true") {
        articles = await Article.find({ active: false }).populate('created_by').populate('updated_by').sort('name')
    } else
        articles = await Article.find({ active: true }).populate('created_by').populate('updated_by').sort('name')
    result = articles.map((m) => {
        return {
            _id: m._id,
            name: m.name,
            display_name: m.display_name,
            active: m.active,
            created_at: m.created_at && moment(m.created_at).format("DD/MM/YYYY"),
            updated_at: m.updated_at && moment(m.updated_at).format("DD/MM/YYYY"),
            created_by: { id: m.created_by._id, value: m.created_by.username, label: m.created_by.username },
            updated_by: { id: m.updated_by._id, value: m.updated_by.username, label: m.updated_by.username }
        }
    })
    return res.status(200).json(result)
}

export const BulkUploadArticle = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file)
        return res.status(400).json({
            message: "please provide an Excel file",
        });
    if (req.file) {
        const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
        if (req.file.size > 100 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
        const workbook = xlsx.read(req.file.buffer);
        let workbook_sheet = workbook.SheetNames;
        let workbook_response: CreateOrEditArticleDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        console.log(workbook_response)
        let newArticles: CreateOrEditArticleDto[] = []
        workbook_response.forEach(async (article) => {
            let name: string | null = article.name
            let display_name: string | null = article.display_name
            console.log(display_name, name)
            newArticles.push({ name: name, display_name: display_name })
        })
        console.log(newArticles)
        newArticles.forEach(async (mac) => {
            let article = await Article.findOne({ display_name: mac.display_name })
            if (!article)
                await new Article({ name: mac.name, display_name: mac.display_name, created_by: req.user, updated_by: req.user }).save()
        })
    }
    return res.status(200).json({ message: "articles updated" });
}
export const CreateArticle = async (req: Request, res: Response, next: NextFunction) => {
    const { name, display_name } = req.body as CreateOrEditArticleDto
    if (!name) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await Article.findOne({ name: name }))
        return res.status(400).json({ message: "already exists this article" })
    let machine = await new Article({
        name: name, display_name: display_name,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()

    return res.status(201).json(machine)

}

export const UpdateArticle = async (req: Request, res: Response, next: NextFunction) => {
    const { name, display_name } = req.body as CreateOrEditArticleDto
    if (!name) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let article = await Article.findById(id)
    if (!article)
        return res.status(404).json({ message: "article not found" })
    if (name !== article.name)
        if (await Article.findOne({ name: name }))
            return res.status(400).json({ message: "already exists this article" })
    article.name = name
    article.display_name = display_name
    article.updated_at = new Date()
    if (req.user)
        article.updated_by = req.user
    await article.save()
    return res.status(200).json(article)

}
export const ToogleArticle = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    let article = await Article.findById(id)
    if (!article)
        return res.status(404).json({ message: "article not found" })
    article.active = !article.active
    article.updated_at = new Date()
    if (req.user)
        article.updated_by = req.user
    await article.save()
    return res.status(200).json(article)

}