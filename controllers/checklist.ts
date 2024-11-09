import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import { Checklist, IChecklist } from "../models/checklist";
import { AssignOrRemoveChecklistDto, CreateOrEditChecklistDto, GetChecklistBoxDto, GetChecklistDto, GetChecklistFromExcelDto } from "../dtos";
import { ChecklistBox, IChecklistBox } from "../models/checklist-box";
import moment from "moment";
import { Asset, User } from "../models/user";
import { uploadFileToCloud } from "../utils/uploadFileToCloud";
import { destroyCloudFile } from "../utils/destroyCloudFile";
import isMongoId from "validator/lib/isMongoId";
import ConvertJsonToExcel from "../utils/ConvertJsonToExcel";
import { ChecklistRemark } from "../models/checklist-remark";
import { getFirstMonday } from "../utils/getFirstMondayDate";
import { ChecklistCategory } from "../models/checklist-category";
import { getBoxes } from "../utils/checklistHelper";
import { nextYear, previousYear } from "../utils/datesHelper";


export const GetChecklistTopBarDetails = async (req: Request, res: Response, next: NextFunction) => {
    let result: { category: string, count: number }[] = []
    let categories = await ChecklistCategory.find().sort('category')
    let count = await Checklist.find({ category: { $in: categories } }).countDocuments()
    result.push({ category: 'total', count: count })
    for (let i = 0; i < categories.length; i++) {
        let cat = categories[i]
        let count = await Checklist.find({ category: categories[i]._id }).countDocuments()
        result.push({ category: cat.category, count: count })
    }
    return res.status(200).json(result)
}


export const GetChecklists = async (req: Request, res: Response, next: NextFunction) => {
    let stage = req.query.stage
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let id = req.query.id
    let checklists: IChecklist[] = []
    let count = 0
    let result: GetChecklistDto[] = []

    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        if (req.user?.is_admin && !id) {
            {
                checklists = await Checklist.find().populate('created_by').populate('updated_by').populate('category').populate('assigned_users').populate('lastcheckedbox').sort('created_at').skip((page - 1) * limit).limit(limit)
                count = await Checklist.find().countDocuments()
            }
        }
        else if (!id) {
            checklists = await Checklist.find({  assigned_users: req.user?._id }).populate('created_by').populate('updated_by').populate('category').populate('lastcheckedbox').populate('assigned_users').sort('created_at').skip((page - 1) * limit).limit(limit)
            count = await Checklist.find({ assigned_users: req.user?._id }).countDocuments()
        }

        else {
            checklists = await Checklist.find({  assigned_users: id }).populate('created_by').populate('updated_by').populate('category').populate('assigned_users').populate('lastcheckedbox').populate({
                path: 'checklist_boxes',
                match: { date: { $gte: previousYear, $lte: nextYear } }, // Filter by date range
            }).sort('created_at').skip((page - 1) * limit).limit(limit)
            count = await Checklist.find({ assigned_users: id }).countDocuments()
        }
        if (stage == "open") {
            checklists = checklists.filter((ch) => {
                return Boolean(!ch.lastcheckedbox)
            })
        }
        if (stage == "pending" || stage == "done") {
            checklists = checklists.filter((ch) => {
                if (ch.lastcheckedbox)
                    return Boolean(ch.lastcheckedbox.stage == stage)
            })
        }

        result = checklists.map((ch) => {
            return {
                _id: ch._id,
                active: ch.active,
                work_title: ch.work_title,
                work_description: ch.work_description,
                link: ch.link,
                last_checked_box: ch.lastcheckedbox && {
                    _id: ch.lastcheckedbox._id,
                    stage: ch.lastcheckedbox.stage,
                    last_remark: ch.lastcheckedbox.last_remark,
                    checklist: { id: ch._id, label: ch.work_title, value: ch.work_title },
                    date: ch.lastcheckedbox.date.toString()
                },
                category: { id: ch.category._id, value: ch.category.category, label: ch.category.category },
                frequency: ch.frequency,
                assigned_users: ch.assigned_users.map((u) => { return { id: u._id, value: u.username, label: u.username } }),
                created_at: ch.created_at.toString(),
                updated_at: ch.updated_at.toString(),
                boxes: getBoxes(ch, ch.checklist_boxes),
                next_date: ch.next_date ? moment(ch.next_date).format("YYYY-MM-DD") : "",
                photo: ch.photo?.public_url || "",
                created_by: { id: ch.created_by._id, value: ch.created_by.username, label: ch.created_by.username },
                updated_by: { id: ch.updated_by._id, value: ch.updated_by.username, label: ch.updated_by.username }
            }
        })


        return res.status(200).json({
            result,
            total: Math.ceil(count / limit),
            page: page,
            limit: limit
        })
    }
    else
        return res.status(400).json({ message: "bad request" })
}

export const GetMobileChecklists = async (req: Request, res: Response, next: NextFunction) => {
    let checklists: IChecklist[] = []
    let result: GetChecklistDto[] = []

    checklists = await Checklist.find({ active: true, assigned_users: req.user?._id }).populate('created_by').populate({
        path: 'checklist_boxes',
        match: { date: { $gte: previousYear, $lte: nextYear } }, // Filter by date range
    }).populate('lastcheckedbox').populate('updated_by').populate('category').populate('assigned_users')

    result = checklists.map((ch) => {
        return {
            _id: ch._id,
            active: ch.active,
            work_title: ch.work_title,
            work_description: ch.work_description,
            link: ch.link,
            last_checked_box: ch.lastcheckedbox && {
                _id: ch.lastcheckedbox._id,
                stage: ch.lastcheckedbox.stage,
                last_remark: ch.lastcheckedbox.last_remark,
                checklist: { id: ch._id, label: ch.work_title, value: ch.work_title },
                date: ch.lastcheckedbox.date.toString()
            },
            category: { id: ch.category._id, value: ch.category.category, label: ch.category.category },
            frequency: ch.frequency,
            assigned_users: ch.assigned_users.map((u) => { return { id: u._id, value: u.username, label: u.username } }),
            created_at: ch.created_at.toString(),
            updated_at: ch.updated_at.toString(),
            boxes: getBoxes(ch, ch.checklist_boxes),
            next_date: ch.next_date ? moment(ch.next_date).format("YYYY-MM-DD") : "",
            photo: ch.photo?.public_url || "",
            created_by: { id: ch.created_by._id, value: ch.created_by.username, label: ch.created_by.username },
            updated_by: { id: ch.updated_by._id, value: ch.updated_by.username, label: ch.updated_by.username }
        }
    })
    return res.status(200).json(result)
}

export const GetChecklistsReport = async (req: Request, res: Response, next: NextFunction) => {
    let stage = req.query.stage
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let id = req.query.id
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let checklists: IChecklist[] = []
    let count = 0
    let dt1 = new Date(String(start_date))
    let dt2 = new Date(String(end_date))
    let result: GetChecklistDto[] = []


    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        if (req.user?.is_admin && !id) {
            {
                checklists = await Checklist.find().populate('created_by').populate('lastcheckedbox').populate('updated_by').populate('category').populate('assigned_users').sort('created_at').skip((page - 1) * limit).limit(limit)
                count = await Checklist.find().countDocuments()
            }
        }
        else if (!id) {
            checklists = await Checklist.find({ assigned_users: req.user?._id }).populate('created_by').populate('lastcheckedbox').populate('updated_by').populate('category').populate('assigned_users').sort('created_at').skip((page - 1) * limit).limit(limit)
            count = await Checklist.find({ user: req.user?._id }).countDocuments()
        }

        else {
            checklists = await Checklist.find({ assigned_users: id }).populate('created_by').populate('lastcheckedbox').populate('updated_by').populate('category').populate('assigned_users').populate({
                path: 'checklist_boxes',
                match: { date: { $gte: previousYear, $lte: nextYear } }, // Filter by date range
            }).sort('created_at').skip((page - 1) * limit).limit(limit)
            count = await Checklist.find({ user: id }).countDocuments()
        }

        if (stage == "open") {
            checklists = checklists.filter((ch) => {
                return Boolean(!ch.lastcheckedbox)
            })
        }
        if (stage == "pending" || stage == "done") {
            checklists = checklists.filter((ch) => {
                if (ch.lastcheckedbox)
                    return Boolean(ch.lastcheckedbox.stage == stage)
            })
        }
       
        result = checklists.map((ch) => {
            return {
                _id: ch._id,
                active: ch.active,
                work_title: ch.work_title,

                work_description: ch.work_description,
                link: ch.link,
                last_checked_box: ch.lastcheckedbox && {
                    _id: ch.lastcheckedbox._id,
                    stage: ch.lastcheckedbox.stage,
                    last_remark: ch.lastcheckedbox.last_remark,
                    checklist: { id: ch._id, label: ch.work_title, value: ch.work_title },
                    date: ch.lastcheckedbox.date.toString()
                },
                category: { id: ch.category._id, value: ch.category.category, label: ch.category.category },
                frequency: ch.frequency,
                assigned_users: ch.assigned_users.map((u) => { return { id: u._id, value: u.username, label: u.username } }),
                created_at: ch.created_at.toString(),
                updated_at: ch.updated_at.toString(),
                boxes: ch.checklist_boxes.filter((b) => {
                    return b.date >= dt1 && b.date < dt2
                }).map((bo) => {
                    return {
                        _id: bo._id,
                        stage: bo.stage,
                        last_remark: bo.last_remark,
                        checklist: { id: ch._id, label: ch.work_title, value: ch.work_title },
                        date: bo.date.toString()
                    }
                }),
                next_date: ch.next_date ? moment(ch.next_date).format("YYYY-MM-DD") : "",
                photo: ch.photo?.public_url || "",
                created_by: { id: ch.created_by._id, value: ch.created_by.username, label: ch.created_by.username },
                updated_by: { id: ch.updated_by._id, value: ch.updated_by.username, label: ch.updated_by.username }
            }
        })

        return res.status(200).json({
            result,
            total: Math.ceil(count / limit),
            page: page,
            limit: limit
        })
    }
    else
        return res.status(400).json({ message: "bad request" })
}


export const CreateChecklist = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body)
    const {
        category,
        work_title,
        work_description,
        link,
        assigned_users,
        frequency } = body as CreateOrEditChecklistDto

    console.log(req.body)
    if (!category || !work_title || !frequency)
        return res.status(400).json({ message: "please provide all required fields" })
    let checklistboxes: IChecklistBox[] = []
    let checklist = new Checklist({
        category: category,
        work_title: work_title,
        work_description: work_description,
        assigned_users: assigned_users,
        link: link,
        frequency: frequency,
        created_at: new Date(),
        created_by: req.user,
        updated_at: new Date(),
        updated_by: req.user
    })

    let document: Asset = undefined
    if (req.file) {
        const allowedFiles = ["image/png", "image/jpeg", "image/gif", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/pdf"];
        const storageLocation = `checklist/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc)
            document = doc
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }
    checklist.photo = document;

    let end_date = new Date();
    end_date.setFullYear(end_date.getFullYear() + 30)

    if (frequency == "daily") {
        let current_date = new Date()
        current_date.setDate(1)
        current_date.setMonth(0)
        while (current_date <= new Date(end_date)) {
            let checklistbox = await new ChecklistBox({
                date: new Date(current_date),
                stage: 'open',
                checklist: checklist._id,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: req.user,
                updated_by: req.user
            }).save()
            checklistboxes.push(checklistbox)
            current_date.setDate(new Date(current_date).getDate() + 1)
        }
    }
    if (frequency == "weekly") {
        let mon = getFirstMonday()
        let current_date = mon;

        console.log(mon)
        while (current_date <= new Date(end_date)) {
            let checklist_box = await new ChecklistBox({
                date: new Date(current_date),
                stage: 'open',
                checklist: checklist._id,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: req.user,
                updated_by: req.user
            }).save()
            checklistboxes.push(checklist_box)
            current_date.setDate(new Date(current_date).getDate() + 7)
        }
    }
    if (frequency == "monthly") {
        let current_date = new Date()
        current_date.setDate(1)
        current_date.setMonth(0)
        while (current_date <= new Date(end_date)) {
            let box = await new ChecklistBox({
                date: new Date(current_date),
                stage: 'open',
                checklist: checklist._id,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: req.user,
                updated_by: req.user
            }).save()
            checklistboxes.push(box)
            current_date.setMonth(new Date(current_date).getMonth() + 1)
        }
    }
    if (frequency == "yearly") {
        let current_date = new Date()
        current_date.setDate(1)
        current_date.setMonth(0)
        current_date.setFullYear(2020)
        while (current_date <= new Date(end_date)) {
            let box = await new ChecklistBox({
                date: new Date(current_date),
                stage: 'open',
                checklist: checklist._id,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: req.user,
                updated_by: req.user
            }).save()
            checklistboxes.push(box)
            current_date.setFullYear(new Date(current_date).getFullYear() + 1)
        }
    }
    console.log(checklistboxes.length)
    checklist.checklist_boxes = checklistboxes;
    await checklist.save();
    return res.status(201).json({ message: `new Checklist added` });
}

export const EditChecklist = async (req: Request, res: Response, next: NextFunction) => {

    let body = JSON.parse(req.body.body)
    const {
        category,
        work_title,
        work_description,
        link,
        assigned_users } = body as CreateOrEditChecklistDto
    if (!work_title)
        return res.status(400).json({ message: "please provide all required fields" })

    let id = req.params.id

    let checklist = await Checklist.findById(id)
    if (!checklist)
        return res.status(404).json({ message: 'checklist not exists' })

    let document: Asset = checklist.photo
    if (req.file) {
        const allowedFiles = ["image/png", "image/jpeg", "image/gif", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/pdf"];
        const storageLocation = `checklist/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc) {
            document = doc
            if (checklist.photo && checklist.photo?._id)
                await destroyCloudFile(checklist.photo._id)
        }
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }

    await Checklist.findByIdAndUpdate(checklist._id, {
        work_title: work_title,
        work_description: work_description,
        category: category,
        link: link,
        assigned_users: assigned_users,
        updated_at: new Date(),
        updated_by: req.user,
        photo: document
    })
    return res.status(200).json({ message: `Checklist updated` });
}
export const ChangeNextDate = async (req: Request, res: Response, next: NextFunction) => {

    const {
        next_date } = req.body as { next_date: string }
    if (!next_date)
        return res.status(400).json({ message: "please provide all required fields" })

    let id = req.params.id

    let checklist = await Checklist.findById(id)
    if (!checklist)
        return res.status(404).json({ message: 'checklist not exists' })

    await Checklist.findByIdAndUpdate(checklist._id, {
        next_date: new Date(next_date),
        updated_at: new Date(),
        updated_by: req.user
    })
    return res.status(200).json({ message: `Checklist next date updated` });
}

export const DeleteChecklist = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: " id not valid" })

    let checklist = await Checklist.findById(id)
    if (!checklist) {
        return res.status(404).json({ message: "Checklist not found" })
    }
    let boxes = await ChecklistBox.find({ checklist: checklist._id })
    for (let i = 0; i < boxes.length; i++) {
        await ChecklistRemark.deleteMany({ checklist_box: boxes[i]._id })
    }
    await ChecklistBox.deleteMany({ checklist: checklist._id })
    if (checklist.photo && checklist.photo?._id)
        await destroyCloudFile(checklist.photo._id)

    await checklist.remove()
    return res.status(200).json({ message: `Checklist deleted` });
}

export const CreateChecklistFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetChecklistFromExcelDto[] = []
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
        let workbook_response: GetChecklistFromExcelDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        if (workbook_response.length > 3000) {
            return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
        }
        let end_date = new Date();
        end_date.setFullYear(end_date.getFullYear() + 30)
        for (let i = 0; i < workbook_response.length; i++) {
            let checklist = workbook_response[i]
            let checklistboxes: IChecklistBox[] = []
            let work_title: string | null = checklist.work_title
            let work_description: string | null = checklist.work_description
            let category: string | null = checklist.category
            let link: string | null = checklist.link
            let frequency: string | null = checklist.frequency
            let assigned_users: string | null = checklist.assigned_users
            let _id: string | undefined = checklist._id

            let validated = true

            //important
            if (!work_title) {
                validated = false
                statusText = "required work title"
            }

            if (!frequency) {
                validated = false
                statusText = "required frequency"
            }
            if (!category) {
                validated = false
                statusText = "required category"
            }
            if (category) {
                let cat = await ChecklistCategory.findOne({ category: category.trim().toLowerCase() })
                if (!cat) {
                    validated = false
                    statusText = "category not found"
                }
                else
                    category = cat._id
            }
            if (work_title) {
                if (_id && isMongoId(String(_id))) {
                    let ch = await Checklist.findById(_id)
                    if (ch?.work_title !== work_title)
                        if (await Checklist.findOne({ work_title: work_title.trim().toLowerCase() })) {
                            validated = false
                            statusText = "checklist already exists"
                        }
                }
                else {
                    if (await Checklist.findOne({ work_title: work_title.trim().toLowerCase() })) {
                        validated = false
                        statusText = "checklist already exists"
                    }
                }
            }

            let users: string[] = []
            if (assigned_users) {
                let names = assigned_users.split(",")
                for (let i = 0; i < names.length; i++) {
                    let u = await User.findOne({ username: names[i] });
                    if (u)
                        users.push(u._id)
                    else {
                        validated = false
                        statusText = `${names[i]} not exists`
                    }
                }

            }
            if (!['daily', 'weekly', 'monthly', 'yearly'].includes(frequency)) {
                validated = false
                statusText = `invalid frequency`
            }
            if (validated) {
                if (_id && isMongoId(String(_id))) {
                    await Checklist.findByIdAndUpdate(checklist._id, {
                        work_title: work_title,
                        work_description: work_description,
                        category: category,
                        link: link,
                        assigned_users: users,
                        updated_at: new Date(),
                        updated_by: req.user
                    })
                    statusText = "updated"
                }
                else {
                    let checklist = new Checklist({
                        work_title,
                        work_description,
                        assigned_users: users,
                        frequency,
                        link,
                        category,
                        created_by: req.user,
                        updated_by: req.user,
                        updated_at: new Date(Date.now()),
                        created_at: new Date(Date.now())
                    })
                    if (frequency == "daily") {
                        let current_date = new Date()
                        current_date.setDate(1)
                        current_date.setMonth(0)
                        while (current_date <= new Date(end_date)) {
                            let checklistbox = await new ChecklistBox({
                                date: new Date(current_date),
                                stage: 'open',
                                checklist: checklist._id,
                                created_at: new Date(),
                                updated_at: new Date(),
                                created_by: req.user,
                                updated_by: req.user
                            }).save()
                            checklistboxes.push(checklistbox)
                            current_date.setDate(new Date(current_date).getDate() + 1)
                        }
                    }
                    if (frequency == "weekly") {
                        let mon = getFirstMonday()
                        let current_date = mon;

                        console.log(mon)
                        while (current_date <= new Date(end_date)) {
                            let checklist_box = await new ChecklistBox({
                                date: new Date(current_date),
                                stage: 'open',
                                checklist: checklist._id,
                                created_at: new Date(),
                                updated_at: new Date(),
                                created_by: req.user,
                                updated_by: req.user
                            }).save()
                            checklistboxes.push(checklist_box)
                            current_date.setDate(new Date(current_date).getDate() + 7)
                        }
                    }
                    if (frequency == "monthly") {
                        let current_date = new Date()
                        current_date.setDate(1)
                        current_date.setMonth(0)
                        while (current_date <= new Date(end_date)) {
                            let box = await new ChecklistBox({
                                date: new Date(current_date),
                                stage: 'open',
                                checklist: checklist._id,
                                created_at: new Date(),
                                updated_at: new Date(),
                                created_by: req.user,
                                updated_by: req.user
                            }).save()
                            checklistboxes.push(box)
                            current_date.setMonth(new Date(current_date).getMonth() + 1)
                        }
                    }
                    if (frequency == "yearly") {
                        let current_date = new Date()
                        current_date.setDate(1)
                        current_date.setMonth(0)
                        current_date.setFullYear(2020)
                        while (current_date <= new Date(end_date)) {
                            let box = await new ChecklistBox({
                                date: new Date(current_date),
                                stage: 'open',
                                checklist: checklist._id,
                                created_at: new Date(),
                                updated_at: new Date(),
                                created_by: req.user,
                                updated_by: req.user
                            }).save()
                            checklistboxes.push(box)
                            current_date.setFullYear(new Date(current_date).getFullYear() + 1)
                        }
                    }
                    console.log(checklistboxes.length)
                    checklist.checklist_boxes = checklistboxes;
                    await checklist.save()
                    statusText = "created"
                }


            }
            result.push({
                ...checklist,
                status: statusText
            })
        }
    }
    return res.status(200).json(result);
}

export const DownloadExcelTemplateForCreatechecklists = async (req: Request, res: Response, next: NextFunction) => {
    let checklists: GetChecklistFromExcelDto[] = [{
        _id: "umc3m9344343vn934",
        category: 'maintenance',
        work_title: 'machine work',
        work_description: 'please check all the parts',
        link: 'http://www.bo.agarson.in',
        assigned_users: 'sujata,pawan',
        frequency: "daily"
    }]


    let users = (await User.find()).map((u) => { return { name: u.username } })
    let categories = (await ChecklistCategory.find()).map((u) => { return { name: u.category } })
    let categoriesids = await ChecklistCategory.find()
    let dt = await Checklist.find({ category: { $in: categoriesids } }).populate('category').populate('assigned_users')
    if (dt && dt.length > 0)
        checklists = dt.map((ch) => {
            return {
                _id: ch._id.valueOf(),
                category: ch.category && ch.category.category || "",
                work_title: ch.work_title,
                work_description: ch.work_description,
                link: ch.link,
                assigned_users: ch.assigned_users.map((a) => { return a.username }).toString(),
                frequency: ch.frequency
            }
        })
    let template: { sheet_name: string, data: any[] }[] = []
    template.push({ sheet_name: 'template', data: checklists })
    template.push({ sheet_name: 'categories', data: categories })
    template.push({ sheet_name: 'users', data: users })
    template.push({ sheet_name: 'frequency', data: [{ frequency: "daily" }, { frequency: "weekly" }, { frequency: "monthly" }, { frequency: "yearly" }] })
    ConvertJsonToExcel(template)
    let fileName = "CreateChecklistTemplate.xlsx"
    return res.download("./file", fileName)
}

export const AssignChecklistToUsers = async (req: Request, res: Response, next: NextFunction) => {
    const { checklist_ids, user_ids, flag } = req.body as AssignOrRemoveChecklistDto
    if (checklist_ids && checklist_ids.length === 0)
        return res.status(400).json({ message: "please select one checklist " })
    if (user_ids && user_ids.length === 0)
        return res.status(400).json({ message: "please select one user" })


    if (flag == 0) {
        for (let k = 0; k < checklist_ids.length; k++) {
            let checklist = await Checklist.findById({ _id: checklist_ids[k] }).populate('assigned_users')

            if (checklist) {
                let oldusers = checklist.assigned_users.map((item) => { return item._id.valueOf() });
                oldusers = oldusers.filter((item) => { return !user_ids.includes(item) });
                await Checklist.findByIdAndUpdate(checklist._id, {
                    assigned_users: oldusers
                })
            }
        }
    }
    else {
        for (let k = 0; k < checklist_ids.length; k++) {
            let checklist = await Checklist.findById({ _id: checklist_ids[k] }).populate('assigned_users')

            if (checklist) {
                let oldusers = checklist.assigned_users.map((item) => { return item._id.valueOf() });

                user_ids.forEach((id) => {
                    if (!oldusers.includes(id))
                        oldusers.push(id)
                })

                await Checklist.findByIdAndUpdate(checklist._id, {
                    assigned_users: oldusers
                })
            }
        }
    }

    return res.status(200).json({ message: "successfull" })
}

export const BulkDeleteChecklists = async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body as { ids: string[] }
    for (let i = 0; i < ids.length; i++) {
        let checklist = await Checklist.findById(ids[i])
        if (!checklist) {
            return res.status(404).json({ message: "Checklist not found" })
        }
        let boxes = await ChecklistBox.find({ checklist: checklist._id })
        for (let i = 0; i < boxes.length; i++) {
            await ChecklistRemark.deleteMany({ checklist_box: boxes[i]._id })
        }
        await ChecklistBox.deleteMany({ checklist: checklist._id })
        if (checklist.photo && checklist.photo?._id)
            await destroyCloudFile(checklist.photo._id)

        await checklist.remove()
    }
    return res.status(200).json({ message: "checklists are deleted" })
}