import { NextFunction, Request, Response, Router } from 'express';
import express from 'express'
import moment from 'moment';
import xlsx from "xlsx";
import { GetArticleDto, CreateOrEditArticleDto } from '../dtos/article.dto';
import { IArticle, Article } from '../models/article.model';
import { DropDownDto } from '../dtos/dropdown.dto';
import isMongoId from "validator/lib/isMongoId";
import { ChecklistCategory } from "../models/checklist-category.model";
import { GetDyeLocationDto, CreateOrEditDyeLocationDto } from "../dtos/dye-location.dto";
import { IDyeLocation, DyeLocation } from "../models/dye-location.model";
import { GetDyeDto, GetDyeDtoFromExcel, CreateOrEditDyeDTo } from "../dtos/dye.dto";
import { Dye, IDye } from "../models/dye.model";
import { ExpenseCategory } from '../models/expense-category.model';
import ConvertJsonToExcel from '../services/ConvertJsonToExcel';
import { ItemUnit } from '../models/item-unit.model';
import { CreateOrEditExpenseItemDto, GetExpenseItemDto, GetExpenseItemFromExcelDto } from '../dtos/expense-item.dto';
import { IExpenseItem, ExpenseItem } from '../models/expense-item.model';
import { LeadType } from '../models/crm-leadtype.model';
import { ExpenseLocation } from '../models/expense-location.model';
import Lead from '../models/lead.model';
import { MachineCategory } from '../models/machine-category.model';
import { IMachine, Machine } from '../models/machine.model';
import { PaymentCategory } from '../models/payment-category.model';
import { ReferredParty } from '../models/refer.model';
import { GetMachineDto, CreateOrEditMachineDto } from '../dtos/machine.dto';
import { LeadSource } from '../models/crm-source.model';
import { Stage } from '../models/crm-stage.model';


export class DropDownController {
 public router: Router
    constructor() {
        this.router = express.Router();
        this.generateRoutes(); // Automatically generate routes
    }
    public async GetArticles(req: Request, res: Response, next: NextFunction) {
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


    public async GetArticlesForDropdown(req: Request, res: Response, next: NextFunction) {
        let hidden = String(req.query.hidden)
        let result: DropDownDto[] = []
        let articles: IArticle[] = []
        if (hidden === "true") {
            articles = await Article.find({ active: false }).populate('created_by').populate('updated_by').sort('name')
        } else
            articles = await Article.find({ active: true }).populate('created_by').populate('updated_by').sort('name')
        result = articles.map((m) => {
            return {
                id: m._id,
                label: m.name
            }
        })
        return res.status(200).json(result)
    }

    public async BulkUploadArticle(req: Request, res: Response, next: NextFunction) {
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
    public async CreateArticle(req: Request, res: Response, next: NextFunction) {
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

    public async UpdateArticle(req: Request, res: Response, next: NextFunction) {
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
    public async ToogleArticle(req: Request, res: Response, next: NextFunction) {
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

    public async GetAllChecklistCategory(req: Request, res: Response, next: NextFunction) {
        let data = await ChecklistCategory.find();
        let result: DropDownDto[] = [];
        result = data.map((r) => { return { id: r._id, label: r.category, value: r.category } });
        return res.status(200).json(result)
    }

    public async CreateChecklistCategory(req: Request, res: Response, next: NextFunction) {
        const { key } = req.body as { key: string }
        if (!key) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        if (await ChecklistCategory.findOne({ category: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this category" })
        let result = await new ChecklistCategory({
            category: key,
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
        return res.status(201).json(result)

    }

    public async UpdateChecklistCategory(req: Request, res: Response, next: NextFunction) {
        const { key } = req.body as {
            key: string,
        }
        if (!key) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        const id = req.params.id
        let oldlocation = await ChecklistCategory.findById(id)
        if (!oldlocation)
            return res.status(404).json({ message: "category not found" })
        console.log(key, oldlocation.category)
        if (key !== oldlocation.category)
            if (await ChecklistCategory.findOne({ category: key.toLowerCase() }))
                return res.status(400).json({ message: "already exists this category" })
        oldlocation.category = key
        oldlocation.updated_at = new Date()
        if (req.user)
            oldlocation.updated_by = req.user
        await oldlocation.save()
        return res.status(200).json(oldlocation)

    }
    public async DeleteChecklistCategory(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "category id not valid" })
        let category = await ChecklistCategory.findById(id);
        if (!category) {
            return res.status(404).json({ message: "category not found" })
        }
        await category.remove();
        return res.status(200).json({ message: "category deleted successfully" })
    }

    public async GetAllDyeLocations(req: Request, res: Response, next: NextFunction) {
        let hidden = String(req.query.hidden)
        let result: GetDyeLocationDto[] = []
        let locations: IDyeLocation[] = []
        if (hidden === "true") {
            locations = await DyeLocation.find({ active: false }).populate('created_by').populate('updated_by')
        } else
            locations = await DyeLocation.find({ active: true }).populate('created_by').populate('updated_by')


        result = locations.map((l) => {
            return {
                _id: l._id,
                name: l.name,
                active: l.active,
                display_name: l.display_name,
                created_at: l.created_at && moment(l.created_at).format("DD/MM/YYYY"),
                updated_at: l.updated_at && moment(l.updated_at).format("DD/MM/YYYY"),
                created_by: { id: l.created_by._id, value: l.created_by.username, label: l.created_by.username },
                updated_by: { id: l.updated_by._id, value: l.updated_by.username, label: l.updated_by.username }
            }
        })
        return res.status(200).json(result)
    }
    public async GetAllDyeLocationsForDropdown(req: Request, res: Response, next: NextFunction) {
        let hidden = String(req.query.hidden)
        let result: DropDownDto[] = []
        let locations: IDyeLocation[] = []
        if (hidden === "true") {
            locations = await DyeLocation.find({ active: false }).populate('created_by').populate('updated_by')
        } else
            locations = await DyeLocation.find({ active: true }).populate('created_by').populate('updated_by')


        result = locations.map((l) => {
            return {
                id: l._id,
                label: l.name
            }
        })
        return res.status(200).json(result)
    }


    public async CreateDyeLocation(req: Request, res: Response, next: NextFunction) {
        const { name, display_name } = req.body as CreateOrEditDyeLocationDto
        if (!name) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        if (await DyeLocation.findOne({ name: name.toLowerCase() }))
            return res.status(400).json({ message: "already exists this dye location" })
        let result = await new DyeLocation({
            name: name,
            display_name: display_name,
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
        return res.status(201).json(result)

    }

    public async UpdateDyeLocation(req: Request, res: Response, next: NextFunction) {
        const { name, display_name } = req.body as CreateOrEditDyeLocationDto
        if (!name) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        const id = req.params.id
        let oldlocation = await DyeLocation.findById(id)
        if (!oldlocation)
            return res.status(404).json({ message: "location not found" })
        if (name !== oldlocation.name)
            if (await DyeLocation.findOne({ name: name.toLowerCase() }))
                return res.status(400).json({ message: "already exists this location" })
        oldlocation.name = name
        oldlocation.display_name = display_name
        oldlocation.updated_at = new Date()
        if (req.user)
            oldlocation.updated_by = req.user
        await oldlocation.save()
        return res.status(200).json(oldlocation)

    }

    public async ToogleDyeLocation(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "location id not valid" })
        let location = await DyeLocation.findById(id);
        if (!location) {
            return res.status(404).json({ message: "location not found" })
        }
        location.active = !location.active
        location.updated_at = new Date()
        if (req.user)
            location.updated_by = req.user
        await location.save()
        return res.status(200).json({ message: "success" })
    }

    public async GetDyeById(req: Request, res: Response, next: NextFunction) {
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

    public async GetDyes(req: Request, res: Response, next: NextFunction) {
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
    public async GetDyeForDropdown(req: Request, res: Response, next: NextFunction) {
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

    public async BulkUploadDye(req: Request, res: Response, next: NextFunction) {
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

    public async CreateDye(req: Request, res: Response, next: NextFunction) {
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
    public async UpdateDye(req: Request, res: Response, next: NextFunction) {
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

    public async ToogleDye(req: Request, res: Response, next: NextFunction) {
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

    public async GetAllExpenseCategory(req: Request, res: Response, next: NextFunction) {
        let data = await ExpenseCategory.find();
        let result: DropDownDto[] = [];
        result = data.map((r) => { return { id: r._id, label: r.category, value: r.category } });
        return res.status(200).json(result)
    }

    public async CreateExpenseCategory(req: Request, res: Response, next: NextFunction) {
        const { key } = req.body as { key: string }
        if (!key) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        if (await ExpenseCategory.findOne({ category: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this category" })
        let result = await new ExpenseCategory({
            category: key,
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
        return res.status(201).json(result)

    }

    public async UpdateExpenseCategory(req: Request, res: Response, next: NextFunction) {
        const { key } = req.body as {
            key: string,
        }
        if (!key) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        const id = req.params.id
        let oldlocation = await ExpenseCategory.findById(id)
        if (!oldlocation)
            return res.status(404).json({ message: "category not found" })
        console.log(key, oldlocation.category)
        if (key !== oldlocation.category)
            if (await ExpenseCategory.findOne({ category: key.toLowerCase() }))
                return res.status(400).json({ message: "already exists this category" })
        oldlocation.category = key
        oldlocation.updated_at = new Date()
        if (req.user)
            oldlocation.updated_by = req.user
        await oldlocation.save()
        return res.status(200).json(oldlocation)

    }

    public async DeleteExpenseCategory(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "category id not valid" })
        let category = await ExpenseCategory.findById(id);
        if (!category) {
            return res.status(404).json({ message: "category not found" })
        }
        await category.remove();
        return res.status(200).json({ message: "category deleted successfully" })
    }

    public async GetAllExpenseItems(req: Request, res: Response, next: NextFunction) {
        let result: GetExpenseItemDto[] = []
        let items: IExpenseItem[] = []
        items = await ExpenseItem.find().populate('unit').populate('category').sort('item')
        result = items.map((item) => {
            return {
                _id: item._id,
                item: item.item,
                price: item.price,
                pricetolerance: item.pricetolerance,
                stock_limit: item.stock_limit,
                stock: item.stock,
                last_remark: "",
                to_maintain_stock: item.to_maintain_stock,
                unit: { id: item.unit._id, label: item.unit.unit, value: item.unit.unit },
                category: { id: item.category._id, label: item.category.category, value: item.category.category },
            }
        })
        return res.status(200).json(result)
    }

    public async GetAllExpenseItemsForDropDown(req: Request, res: Response, next: NextFunction) {
        let result: DropDownDto[] = []
        let items: IExpenseItem[] = []
        items = await ExpenseItem.find().populate('unit').sort('item')
        result = items.map((item) => {
            return {
                id: item._id,
                label: item.item,
                value: item.item
            }
        })
        return res.status(200).json(result)
    }

    public async CreateExpenseItem(req: Request, res: Response, next: NextFunction) {
        const { item, unit, category, stock, to_maintain_stock, price, pricetolerance,
            stock_limit, } = req.body as CreateOrEditExpenseItemDto
        if (!item || !unit || !category || !price || !pricetolerance) {
            return res.status(400).json({ message: "please provide required fields" })
        }

        if (await ExpenseItem.findOne({ item: item.toLowerCase(), category: category }))
            return res.status(400).json({ message: "already exists this item" })
        let result = await new ExpenseItem({
            item: item,
            price, pricetolerance, stock_limit,
            unit,
            stock,
            category,
            to_maintain_stock,
            created_at: new Date(),
            created_by: req.user,
            updated_at: new Date(),
            updated_by: req.user
        }).save()
        return res.status(201).json(result)

    }

    public async UpdateExpenseItem(req: Request, res: Response, next: NextFunction) {
        const { item, unit, category, stock, price, pricetolerance,
            stock_limit } = req.body as CreateOrEditExpenseItemDto
        if (!item || !item || !category || !price || !pricetolerance) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        const id = req.params.id
        let olditem = await ExpenseItem.findById(id)
        if (!olditem)
            return res.status(404).json({ message: "item not found" })
        if (item !== olditem.item)
            if (await ExpenseItem.findOne({ item: item.toLowerCase(), category: category }))
                return res.status(400).json({ message: "already exists this item" })
        await ExpenseItem.findByIdAndUpdate(id, {
            item, unit, category, stock, price, stock_limit, pricetolerance, updated_at: new Date(),
            updated_by: req.user
        })
        return res.status(200).json(olditem)

    }
    public async DeleteExpenseItem(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "item id not valid" })
        let item = await ExpenseItem.findById(id);
        if (!item) {
            return res.status(404).json({ message: "item not found" })
        }

        await ExpenseItem.findByIdAndDelete(id);

        return res.status(200).json({ message: "item deleted successfully" })
    }
    public async BulkCreateAndUpdateExpenseItemFromExcel(req: Request, res: Response, next: NextFunction) {
        let result: GetExpenseItemFromExcelDto[] = []
        let statusText: string = ""
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
            let workbook_response: GetExpenseItemFromExcelDto[] = xlsx.utils.sheet_to_json(
                workbook.Sheets[workbook_sheet[0]]
            );

            if (workbook_response.length > 3000) {
                return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
            }

            for (let i = 0; i < workbook_response.length; i++) {
                let data = workbook_response[i]
                let item: string | null = String(data.item)
                let unit: string | null = String(data.unit)
                let stock: number | null = data.stock && Number(data.stock) || 0
                let price: number | null = data.price && Number(data.price) || 0
                let pricetolerance: number | null = data.pricetolerance && Number(data.pricetolerance) || 0
                let stock_limit: number | null = data.stock_limit && Number(data.stock_limit) || 0
                let category: string | null = String(data.category)
                let to_maintain_stock: boolean | null = data.to_maintain_stock
                let isValidated = true;
                if (!category) {
                    statusText = "category required"
                    isValidated = false
                }
                if (!unit) {
                    statusText = "unit required"
                    isValidated = false
                }
                if (!pricetolerance) {
                    statusText = "price tolerance required"
                    isValidated = false
                }
                let cat = await ExpenseCategory.findOne({ category: category })
                if (!cat) {
                    statusText = "category not found"
                    isValidated = false
                }
                let un = await ItemUnit.findOne({ unit: unit })
                if (!un) {
                    statusText = "unit not found"
                    isValidated = false
                }
                if (isValidated) {
                    if (data._id && isMongoId(String(data._id))) {
                        let olditem = await ExpenseItem.findById(data._id)
                        if (olditem) {
                            if (item !== olditem.item)
                                if (!await ExpenseItem.findOne({ item: item.toLowerCase(), category: cat })) {

                                    olditem.item = item
                                    olditem.to_maintain_stock = to_maintain_stock
                                    olditem.stock = stock
                                    olditem.price = price
                                    olditem.stock_limit = stock_limit
                                    olditem.pricetolerance = pricetolerance
                                    if (cat)
                                        olditem.category = cat
                                    if (un)
                                        olditem.unit = un
                                    olditem.updated_at = new Date()
                                    if (req.user)
                                        olditem.updated_by = req.user
                                    await olditem.save()
                                    statusText = "updated"

                                }
                        }
                    }

                    if (!data._id || !isMongoId(String(data._id))) {
                        let olditem = await ExpenseItem.findOne({ item: item.toLowerCase(), category: cat })
                        if (!olditem) {
                            await new ExpenseItem({
                                item: item,
                                category: cat,
                                unit: un,
                                price, pricetolerance, stock_limit,
                                to_maintain_stock,
                                stock: stock,
                                created_by: req.user,
                                updated_by: req.user,
                                created_at: new Date(),
                                updated_at: new Date()
                            }).save()
                            statusText = "created"
                        }
                        else
                            statusText = "duplicate"
                    }
                }



                result.push({
                    ...data,
                    status: statusText
                })
            }


        }
        return res.status(200).json(result);
    }

    public async DownloadExcelTemplateForCreateExpenseItem(req: Request, res: Response, next: NextFunction) {
        let checklists: GetExpenseItemFromExcelDto[] = [{
            _id: 'hwhii',
            item: 'belt',
            unit: 'kg',
            price: 35,
            pricetolerance: 10,
            stock_limit: 0,
            to_maintain_stock: false,
            category: 'GUMBOOT',
            stock: 5
        }]


        let categories = (await ExpenseCategory.find()).map((u) => { return { name: u.category } })
        let units = (await ItemUnit.find()).map((i) => { return { unit: i.unit } })

        let template: { sheet_name: string, data: any[] }[] = []
        template.push({ sheet_name: 'template', data: checklists })
        template.push({ sheet_name: 'categories', data: categories })
        template.push({ sheet_name: 'unit', data: units })

        ConvertJsonToExcel(template)
        let fileName = "CreateExpenseItemTemplate.xlsx"
        return res.download("./file", fileName)
    }


    public async GetAllExpenseLocation(req: Request, res: Response, next: NextFunction) {
        let data = await ExpenseLocation.find();
        let result: DropDownDto[] = [];
        result = data.map((r) => { return { id: r._id, label: r.name, value: r.name } });
        return res.status(200).json(result)
    }

    public async CreateExpenseLocation(req: Request, res: Response, next: NextFunction) {
        const { key } = req.body as { key: string }
        if (!key) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        if (await ExpenseLocation.findOne({ name: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this location" })
        let result = await new ExpenseLocation({
            name: key,
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
        return res.status(201).json(result)

    }

    public async UpdateExpenseLocation(req: Request, res: Response, next: NextFunction) {
        const { key } = req.body as {
            key: string,
        }
        if (!key) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        const id = req.params.id
        let oldlocation = await ExpenseLocation.findById(id)
        if (!oldlocation)
            return res.status(404).json({ message: "location not found" })
        console.log(key, oldlocation.name)
        if (key !== oldlocation.name)
            if (await ExpenseLocation.findOne({ name: key.toLowerCase() }))
                return res.status(400).json({ message: "already exists this location" })
        oldlocation.name = key
        oldlocation.updated_at = new Date()
        if (req.user)
            oldlocation.updated_by = req.user
        await oldlocation.save()
        return res.status(200).json(oldlocation)

    }
    public async DeleteExpenseLocation(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "location id not valid" })
        let name = await ExpenseLocation.findById(id);
        if (!name) {
            return res.status(404).json({ message: "location not found" })
        }
        await name.remove();
        return res.status(200).json({ message: "location deleted successfully" })
    }

    public async GetAllPaymentCategory(req: Request, res: Response, next: NextFunction) {
        let result = await PaymentCategory.find();
        let data: DropDownDto[];
        data = result.map((r) => { return { id: r._id, label: r.category, value: r.category } });
        return res.status(200).json(data)
    }

    public async CreatePaymentCategory(req: Request, res: Response, next: NextFunction) {
        const { key } = req.body as { key: string }
        if (!key) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        if (await PaymentCategory.findOne({ category: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this category" })
        let result = await new PaymentCategory({
            category: key,
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
        return res.status(201).json(result)

    }

    public async UpdatePaymentCategory(req: Request, res: Response, next: NextFunction) {
        const { key } = req.body as {
            key: string,
        }
        if (!key) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        const id = req.params.id
        let oldlocation = await PaymentCategory.findById(id)
        if (!oldlocation)
            return res.status(404).json({ message: "category not found" })
        console.log(key, oldlocation.category)
        if (key !== oldlocation.category)
            if (await PaymentCategory.findOne({ category: key.toLowerCase() }))
                return res.status(400).json({ message: "already exists this category" })
        oldlocation.category = key
        oldlocation.updated_at = new Date()
        if (req.user)
            oldlocation.updated_by = req.user
        await oldlocation.save()
        return res.status(200).json(oldlocation)

    }
    public async DeletePaymentCategory(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "category id not valid" })
        let category = await PaymentCategory.findById(id);
        if (!category) {
            return res.status(404).json({ message: "category not found" })
        }
        await category.remove();
        return res.status(200).json({ message: "category deleted successfully" })
    }
    public async GetMachineCategories(req: Request, res: Response, next: NextFunction) {
        let result = (await MachineCategory.find()).map((c) => {
            return { id: c._id, label: c.category, value: c.category }
        })
        return res.status(200).json(result)
    }
    public async CreateMachineCategory(req: Request, res: Response, next: NextFunction) {
        const { key } = req.body as { key: string }
        if (!key) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        if (await MachineCategory.findOne({ category: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this category" })
        let result = await new MachineCategory({
            category: key,
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
        return res.status(201).json({ message: "success" })

    }

    public async UpdateMachineCategory(req: Request, res: Response, next: NextFunction) {
        const { key } = req.body as { key: string }
        if (!key) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        const id = req.params.id
        let oldtype = await MachineCategory.findById(id)
        if (!oldtype)
            return res.status(404).json({ message: "category not found" })
        if (key !== oldtype.category)
            if (await MachineCategory.findOne({ category: key.toLowerCase() }))
                return res.status(400).json({ message: "already exists this category" })
        let prevtype = oldtype.category
        oldtype.category = key
        oldtype.updated_at = new Date()
        if (req.user)
            oldtype.updated_by = req.user
        await Machine.updateMany({ category: prevtype }, { category: key })
        await oldtype.save()
        return res.status(200).json({ message: "updated" })

    }
    public async DeleteMachineCategory(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "category id not valid" })
        let category = await MachineCategory.findById(id);
        if (!category) {
            return res.status(404).json({ message: "category not found" })
        }
        await category.remove();
        return res.status(200).json({ message: "category deleted successfully" })
    }

    public async GetAllCRMLeadTypes(req: Request, res: Response, next: NextFunction) {
        let result: DropDownDto[] = []
        let types = await LeadType.find()
        result = types.map((t) => {
            return { id: t._id, value: t.type, label: t.type }
        })
        return res.status(200).json(result)
    }


    public async CreateCRMLeadTypes(req: Request, res: Response, next: NextFunction) {
        const { key } = req.body as { key: string }
        if (!key) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        if (await LeadType.findOne({ type: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this type" })
        let result = await new LeadType({
            type: key,
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
        return res.status(201).json({ message: "success" })

    }

    public async UpdateCRMLeadTypes(req: Request, res: Response, next: NextFunction) {
        const { key } = req.body as { key: string }
        if (!key) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        const id = req.params.id
        let oldtype = await LeadType.findById(id)
        if (!oldtype)
            return res.status(404).json({ message: "type not found" })
        if (key !== oldtype.type)
            if (await LeadType.findOne({ type: key.toLowerCase() }))
                return res.status(400).json({ message: "already exists this type" })
        let prevtype = oldtype.type
        oldtype.type = key
        oldtype.updated_at = new Date()
        if (req.user)
            oldtype.updated_by = req.user
        await Lead.updateMany({ type: prevtype }, { type: key })
        await ReferredParty.updateMany({ type: prevtype }, { type: key })
        await oldtype.save()
        return res.status(200).json({ message: "updated" })

    }
    public async DeleteCRMLeadType(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "type id not valid" })
        let type = await LeadType.findById(id);
        if (!type) {
            return res.status(404).json({ message: "type not found" })
        }
        await type.remove();
        return res.status(200).json({ message: "lead type deleted successfully" })
    }

    public async GetAllItemUnit(req: Request, res: Response, next: NextFunction) {
        let data = await ItemUnit.find();
        let result: DropDownDto[] = [];
        result = data.map((r) => { return { id: r._id, label: r.unit, value: r.unit } });
        return res.status(200).json(result)
    }

    public async CreateItemUnit(req: Request, res: Response, next: NextFunction) {
        const { key } = req.body as { key: string }
        if (!key) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        if (await ItemUnit.findOne({ unit: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this unit" })
        let result = await new ItemUnit({
            unit: key,
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
        return res.status(201).json(result)

    }

    public async UpdateItemUnit(req: Request, res: Response, next: NextFunction) {
        const { key } = req.body as {
            key: string,
        }
        if (!key) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        const id = req.params.id
        let oldlocation = await ItemUnit.findById(id)
        if (!oldlocation)
            return res.status(404).json({ message: "unit not found" })
        console.log(key, oldlocation.unit)
        if (key !== oldlocation.unit)
            if (await ItemUnit.findOne({ unit: key.toLowerCase() }))
                return res.status(400).json({ message: "already exists this unit" })
        oldlocation.unit = key
        oldlocation.updated_at = new Date()
        if (req.user)
            oldlocation.updated_by = req.user
        await oldlocation.save()
        return res.status(200).json(oldlocation)

    }
    public async DeleteItemUnit(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "unit id not valid" })
        let unit = await ItemUnit.findById(id);
        if (!unit) {
            return res.status(404).json({ message: "unit not found" })
        }
        await unit.remove();
        return res.status(200).json({ message: "unit deleted successfully" })
    }

    public async GetAllCRMLeadSources(req: Request, res: Response, next: NextFunction) {
        let result: DropDownDto[] = []
        let sources = await LeadSource.find()
        result = sources.map((i) => {
            return { id: i._id, value: i.source, label: i.source }
        })
        return res.status(200).json(result)
    }


    public async CreateCRMLeadSource(req: Request, res: Response, next: NextFunction) {
        const { key } = req.body as { key: string }
        if (!key) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        if (await LeadSource.findOne({ source: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this source" })
        let result = await new LeadSource({
            source: key,
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
        return res.status(201).json(result)

    }

    public async UpdateCRMLeadSource(req: Request, res: Response, next: NextFunction) {
        const { key } = req.body as { key: string }
        if (!key) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        const id = req.params.id
        let oldsource = await LeadSource.findById(id)
        if (!oldsource)
            return res.status(404).json({ message: "source not found" })
        if (key !== oldsource.source)
            if (await LeadSource.findOne({ source: key.toLowerCase() }))
                return res.status(400).json({ message: "already exists this source" })
        let prevsource = oldsource.source
        oldsource.source = key
        oldsource.updated_at = new Date()
        if (req.user)
            oldsource.updated_by = req.user
        await Lead.updateMany({ source: prevsource }, { source: key })
        await ReferredParty.updateMany({ source: prevsource }, { source: key })
        await oldsource.save()
        return res.status(200).json(oldsource)

    }
    public async DeleteCRMLeadSource(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "source id not valid" })
        let source = await LeadSource.findById(id);
        if (!source) {
            return res.status(404).json({ message: "source not found" })
        }
        await source.remove();
        return res.status(200).json({ message: "lead source deleted successfully" })
    }

    public async GetAllCRMLeadStages(req: Request, res: Response, next: NextFunction) {
        let stages: DropDownDto[] = []
        stages = await (await Stage.find()).map((i) => { return { id: i._id, label: i.stage, value: i.stage } });
        return res.status(200).json(stages)
    }


    public async CreateCRMLeadStages(req: Request, res: Response, next: NextFunction) {
        const { key } = req.body as { key: string }
        if (!key) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        if (await Stage.findOne({ stage: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this stage" })
        let result = await new Stage({
            stage: key,
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
        return res.status(201).json(result)

    }

    public async UpdateCRMLeadStages(req: Request, res: Response, next: NextFunction) {
        const { key } = req.body as { key: string }

        if (!key) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        const id = req.params.id
        let oldstage = await Stage.findById(id)
        if (!oldstage)
            return res.status(404).json({ message: "stage not found" })
        if (key !== oldstage.stage)
            if (await Stage.findOne({ stage: key.toLowerCase() }))
                return res.status(400).json({ message: "already exists this stage" })
        let prevstage = oldstage.stage
        oldstage.stage = key
        oldstage.updated_at = new Date()
        if (req.user)
            oldstage.updated_by = req.user
        await Lead.updateMany({ stage: prevstage }, { stage: key })
        await ReferredParty.updateMany({ stage: prevstage }, { stage: key })
        await oldstage.save()
        return res.status(200).json(oldstage)

    }
    public async DeleteCRMLeadStage(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "stage id not valid" })
        let stage = await Stage.findById(id);
        if (!stage) {
            return res.status(404).json({ message: "stage not found" })
        }
        await stage.remove();
        return res.status(200).json({ message: "lead stage deleted successfully" })
    }
    public async FindUnknownCrmStages(req: Request, res: Response, next: NextFunction) {
        let stages = await Stage.find({ stage: { $ne: "" } });
        let stagevalues = stages.map(i => { return i.stage });
        await Lead.updateMany({ stage: { $nin: stagevalues } }, { stage: 'unknown' });
        return res.status(200).json({ message: "successfull" })
    }

    public async GetMachines(req: Request, res: Response, next: NextFunction) {
        let hidden = String(req.query.hidden)
        let machines: IMachine[] = []
        let result: GetMachineDto[] = []
        if (hidden === "true") {
            machines = await Machine.find({ active: false }).populate('created_by').populate('updated_by').sort('serial_no')
        } else
            machines = await Machine.find({ active: true }).populate('created_by').populate('updated_by').sort('serial_no')
        result = machines.map((m) => {
            return {
                _id: m._id,
                name: m.name,
                active: m.active,
                category: m.category,
                serial_no: m.serial_no,
                display_name: m.display_name,
                created_at: m.created_at && moment(m.created_at).format("DD/MM/YYYY"),
                updated_at: m.updated_at && moment(m.updated_at).format("DD/MM/YYYY"),
                created_by: { id: m.created_by._id, value: m.created_by.username, label: m.created_by.username },
                updated_by: { id: m.updated_by._id, value: m.updated_by.username, label: m.updated_by.username }
            }
        })
        return res.status(200).json(result)
    }
    public async GetMachinesForDropDown(req: Request, res: Response, next: NextFunction) {
        let hidden = String(req.query.hidden)
        let machines: IMachine[] = []
        let result: DropDownDto[] = []
        if (hidden === "true") {
            machines = await Machine.find({ active: false }).populate('created_by').populate('updated_by').sort('serial_no')
        } else
            machines = await Machine.find({ active: true }).populate('created_by').populate('updated_by').sort('serial_no')
        result = machines.map((m) => {
            return {
                id: m._id,
                label: m.name
            }
        })
        return res.status(200).json(result)
    }

    public async CreateMachine(req: Request, res: Response, next: NextFunction) {
        const { name, display_name, category, serial_no } = req.body as CreateOrEditMachineDto
        if (!name || !display_name || !category || !serial_no) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        if (await Machine.findOne({ name: name }))
            return res.status(400).json({ message: "already exists this machine" })
        let machine = await new Machine({
            name: name, display_name: display_name, category: category,
            serial_no: serial_no,
            created_at: new Date(),
            updated_by: req.user,
            updated_at: new Date(),
            created_by: req.user,
        }).save()

        return res.status(201).json(machine)
    }

    public async BulkUploadMachine(req: Request, res: Response, next: NextFunction) {
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
            let workbook_response: CreateOrEditMachineDto[] = xlsx.utils.sheet_to_json(
                workbook.Sheets[workbook_sheet[0]]
            );
            console.log(workbook_response)
            let newMachines: { name: string, display_name: string, category: string, serial_no: number, }[] = []
            workbook_response.forEach(async (machine) => {
                let name: string | null = machine.name
                let display_name: string | null = machine.display_name
                let category: string | null = machine.category
                let serial_no: number | null = machine.serial_no
                console.log(display_name, name)
                newMachines.push({ name: name, display_name: display_name, category: category, serial_no: machine.serial_no, })
            })
            console.log(newMachines)
            newMachines.forEach(async (mac) => {
                let machine = await Machine.findOne({ name: mac.name })
                if (!machine)
                    await new Machine({ name: mac.name, display_name: mac.display_name, category: mac.category, serial_no: mac.serial_no, created_by: req.user, updated_by: req.user }).save()
            })
        }
        return res.status(200).json({ message: "machines updated" });
    }
    public async UpdateMachine(req: Request, res: Response, next: NextFunction) {
        const { name, display_name, category, serial_no } = req.body as CreateOrEditMachineDto
        if (!name || !display_name || !category || !serial_no) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        const id = req.params.id
        let machine = await Machine.findById(id)
        if (!machine)
            return res.status(404).json({ message: "machine not found" })
        if (name !== machine.name)
            if (await Machine.findOne({ name: name }))
                return res.status(400).json({ message: "already exists this machine" })
        machine.name = name
        machine.display_name = display_name
        machine.serial_no = serial_no
        machine.category = category
        machine.updated_at = new Date()
        if (req.user)
            machine.updated_by = req.user
        await machine.save()
        return res.status(200).json(machine)
    }

    public async ToogleMachine(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id
        let machine = await Machine.findById(id)
        if (!machine)
            return res.status(404).json({ message: "machine not found" })
        machine.active = !machine.active
        machine.updated_at = new Date()
        if (req.user)
            machine.updated_by = req.user
        await machine.save()
        return res.status(200).json(machine)

    }
    private generateRoutes(): void {
        const methodPrefix = ['get', 'post', 'put', 'patch', 'delete']; // Allowed HTTP methods

        Object.getOwnPropertyNames(Object.getPrototypeOf(this))
            .filter((methodName) => methodName !== 'constructor' && typeof (this as any)[methodName] === 'function')
            .forEach((methodName) => {
                const match = methodName.match(new RegExp(`^(${methodPrefix.join('|')})([A-Z].*)$`));
                if (match) {
                    const [, httpMethod, routeName] = match;
                    const routePath =
                        '/' +
                        routeName
                            .replace(/([A-Z])/g, '-$1')
                            .toLowerCase()
                            .substring(1); // Convert "CamelCase" to "kebab-case"
                    //@ts-ignore
                    this.router[httpMethod](routePath, (this as any)[methodName].bind(this));
                }
            });
    }
}