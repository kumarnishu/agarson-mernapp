import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import moment from "moment";
import { GetDyeDto, GetDyeDtoFromExcel, CreateOrEditDyeDTo } from "../dtos/dye.dto";
import { IArticle, Article } from "../models/article.model";
import { Dye, IDye } from "../models/dye.model";
import { DropDownDto } from "../dtos/dropdown.dto";

export const GetDyeById = async (req: Request, res: Response, next: NextFunction) => {
    let id = req.params.id;

    let dye = await Dye.findById(id).populate('articles');
    if (!dye)
        return res.status(404).json({ message: "dye not exists" })
    let result: GetDyeDto = {
        _id: dye._id,
        active: dye.active,
        dye_number: dye.dye_number,
        size: dye.size,
        articles: dye.articles.map((a) => { return { id: a._id, value: a.name, label: a.name } }),
        stdshoe_weight: dye.stdshoe_weight,
        created_at: dye.created_at && moment(dye.created_at).format("DD/MM/YYYY"),
        updated_at: dye.updated_at && moment(dye.updated_at).format("DD/MM/YYYY"),
        created_by: { id: dye.created_by._id, label: dye.created_by.username },
        updated_by: { id: dye.updated_by._id, label: dye.updated_by.username }
    }
    return res.status(200).json(result)
}

export const GetDyes = async (req: Request, res: Response, next: NextFunction) => {
    let hidden = String(req.query.hidden)
    let dyes: IDye[] = []
    let result: GetDyeDto[] = []
    if (hidden === "true") {
        dyes = await Dye.find({ active: false }).populate('articles').populate('created_by').populate('updated_by').sort('dye_number')
    } else
        dyes = await Dye.find({ active: true }).populate('articles').populate('created_by').populate('updated_by').sort('dye_number')
    result = dyes.map((dye) => {
        return {
            _id: dye._id,
            active: dye.active,
            dye_number: dye.dye_number,
            size: dye.size,
            articles: dye.articles.map((a) => { return { id: a._id, value: a.name, label: a.name } }),
            stdshoe_weight: dye.stdshoe_weight,
            created_at: dye.created_at && moment(dye.created_at).format("DD/MM/YYYY"),
            updated_at: dye.updated_at && moment(dye.updated_at).format("DD/MM/YYYY"),
            created_by: { id: dye.created_by._id, value: dye.created_by.username, label: dye.created_by.username },
            updated_by: { id: dye.updated_by._id, value: dye.updated_by.username, label: dye.updated_by.username }
        }
    })
    return res.status(200).json(result)
}
export const GetDyeForDropdown = async (req: Request, res: Response, next: NextFunction) => {
    let hidden = String(req.query.hidden)
    let dyes: IDye[] = []
    let result: DropDownDto[] = []
    if (hidden === "true") {
        dyes = await Dye.find({ active: false }).populate('articles').populate('created_by').populate('updated_by').sort('dye_number')
    } else
        dyes = await Dye.find({ active: true }).populate('articles').populate('created_by').populate('updated_by').sort('dye_number')
    result = dyes.map((dye) => {
        return {
            id: dye._id,
            label: String(dye.dye_number),

        }
    })
    return res.status(200).json(result)
}

export const BulkUploadDye = async (req: Request, res: Response, next: NextFunction) => {
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
        let workbook_response: GetDyeDtoFromExcel[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        let newDyes: { dye_number: number, size: string, articles: IArticle[], st_weight: number }[] = []

        for (let i = 0; i < workbook_response.length; i++) {
            let dye_number: number | null = workbook_response[i].dye_number
            let size: string | null = workbook_response[i].size
            let articles: string[] | null = workbook_response[i].articles && workbook_response[i].articles.split(",") || []
            let st_weight: number | null = workbook_response[i].st_weight
            let newArticles: IArticle[] = []
            if (articles && articles.length > 0) {
                for (let j = 0; j < articles.length; j++) {
                    let art = await Article.findOne({ name: articles[j].toLowerCase().trim() })
                    if (art) {
                        newArticles.push(art)
                    }
                }
            }

            newDyes.push({ dye_number: dye_number, size: size, articles: newArticles, st_weight: st_weight })
        }


        for (let i = 0; i < newDyes.length; i++) {
            let mac = newDyes[i];
            let dye = await Dye.findOne({ dye_number: mac.dye_number })
            if (!dye) {
                await new Dye({ dye_number: mac.dye_number, size: mac.size, articles: newDyes[i].articles, stdshoe_weight: mac.st_weight, created_by: req.user, updated_by: req.user }).save()
            }
            else {
                await Dye.findByIdAndUpdate(dye._id, {
                    dye_number: mac.dye_number, size: mac.size, articles: newDyes[i].articles, stdshoe_weight: mac.st_weight, created_by: req.user, updated_by: req.user
                })
            }
        }

    }
    return res.status(200).json({ message: "dyes updated" });
}

export const CreateDye = async (req: Request, res: Response, next: NextFunction) => {
    const { dye_number, size, articles, st_weight } = req.body as CreateOrEditDyeDTo
    if (!dye_number || !size) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await Dye.findOne({ dye_number: dye_number }))
        return res.status(400).json({ message: "already exists this dye" })

    let dye = await new Dye({
        dye_number: dye_number, size: size,
        articles: articles,
        stdshoe_weight: st_weight,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(dye)
}
export const UpdateDye = async (req: Request, res: Response, next: NextFunction) => {
    const { dye_number, size, articles, st_weight } = req.body as CreateOrEditDyeDTo
    if (!dye_number || !size) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }

    const id = req.params.id
    let dye = await Dye.findById(id)
    if (!dye)
        return res.status(404).json({ message: "dye not found" })
    if (dye_number !== dye.dye_number)
        if (await Dye.findOne({ dye_number: dye_number }))
            return res.status(400).json({ message: "already exists this dye" })


    dye.dye_number = dye_number
    dye.size = size
    //@ts-ignore
    dye.articles = articles
    dye.stdshoe_weight = st_weight,
        dye.updated_at = new Date()
    if (req.user)
        dye.updated_by = req.user
    await dye.save()
    return res.status(200).json(dye)
}

export const ToogleDye = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    let dye = await Dye.findById(id)
    if (!dye)
        return res.status(404).json({ message: "dye not found" })
    dye.active = !dye.active
    dye.updated_at = new Date()
    if (req.user)
        dye.updated_by = req.user
    await dye.save()
    return res.status(200).json(dye)
}
