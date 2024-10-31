import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import { Checklist, IChecklist } from "../models/checklist";
import { CreateOrEditChecklistDto, GetChecklistDto, GetChecklistFromExcelDto } from "../dtos";
import { ChecklistBox } from "../models/checklist-box";
import moment from "moment";
import { Asset } from "../models/user";
import { uploadFileToCloud } from "../utils/uploadFileToCloud";
import { destroyCloudFile } from "../utils/destroyCloudFile";
import isMongoId from "validator/lib/isMongoId";
import ConvertJsonToExcel from "../utils/ConvertJsonToExcel";
import { ChecklistRemark } from "../models/checklist-remark";

export const GetChecklists = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let id = req.query.id
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let checklists: IChecklist[] = []
    let count = 0
    let dt1 = new Date(String(start_date))
    let dt2 = new Date(String(end_date))
    let ids = req.user?.assigned_users.map((id: { _id: string }) => { return id._id })
    let result: GetChecklistDto[] = []

    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        if (req.user?.is_admin && !id) {
            {
                checklists = await Checklist.find().populate('created_by').populate('updated_by').populate('category').populate('assigned_users').sort('updated_at').skip((page - 1) * limit).limit(limit)
                count = await Checklist.find().countDocuments()
            }
        }
        else if (ids && ids.length > 0 && !id) {
            {
                checklists = await Checklist.find({ user: { $in: ids } }).populate('created_by').populate('updated_by').populate('category').populate('assigned_users').sort('updated_at').skip((page - 1) * limit).limit(limit)
                count = await Checklist.find({ user: { $in: ids } }).countDocuments()
            }
        }
        else if (!id) {
            checklists = await Checklist.find({ user: req.user?._id }).populate('created_by').populate('updated_by').populate('category').populate('assigned_users').sort('updated_at').skip((page - 1) * limit).limit(limit)
            count = await Checklist.find({ user: req.user?._id }).countDocuments()
        }

        else {
            checklists = await Checklist.find({ user: id }).populate('created_by').populate('updated_by').populate('category').populate('assigned_users').sort('updated_at').skip((page - 1) * limit).limit(limit)
            count = await Checklist.find({ user: id }).countDocuments()
        }



        for (let i = 0; i < checklists.length; i++) {
            let ch = checklists[i];
            if (ch && ch.category) {
                let boxes = await ChecklistBox.find({ checklist: ch._id, date: { $gte: dt1, $lt: dt2 } }).sort('date').populate('checklist');
                let lastcheckedbox = await ChecklistBox.findOne({ checklist: ch._id, stage:{$ne: 'pending'} }).sort('-date')
                let dtoboxes = boxes.map((b) => {
                    return {
                        _id: b._id,
                        stage: b.stage,
                        checklist: { id: b.checklist._id, label: b.checklist.work_title, value: b.checklist.work_title },
                        date: b.date.toString()
                    }
                });
                let users = ch.assigned_users.map((u) => { return { id: u._id, value: u.username, label: u.username } })
                result.push({
                    _id: ch._id,
                    active: ch.active,
                    work_title: ch.work_title,
                    work_description: ch.work_description,
                    link: ch.link,
                    last_checked_date: lastcheckedbox ? moment(lastcheckedbox.date).format('DD/MM/YYYY') : "",
                    category: { id: ch.category._id, value: ch.category.category, label: ch.category.category },
                    frequency: ch.frequency,
                    assigned_users: users,
                    created_at: ch.created_at.toString(),
                    updated_at: ch.updated_at.toString(),
                    boxes: dtoboxes,
                    next_date: ch.next_date ? moment(ch.next_date).format('DD/MM/YYYY') : "",
                    photo: ch.photo?.public_url || "",
                    created_by: { id: ch.created_by._id, value: ch.created_by.username, label: ch.created_by.username },
                    updated_by: { id: ch.updated_by._id, value: ch.updated_by.username, label: ch.updated_by.username }
                })
            }
        }

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
    await checklist.save();
    let end_date = new Date();
    end_date.setFullYear(end_date.getFullYear() + 30)

    if (frequency == "daily") {
        let current_date = new Date()
        current_date.setDate(1)
        while (current_date <= new Date(end_date)) {
            await new ChecklistBox({
                date: new Date(current_date),
                stage: 'open',
                checklist: checklist._id,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: req.user,
                updated_by: req.user
            }).save()
            current_date.setDate(new Date(current_date).getDate() + 1)
        }
    }
    if (frequency == "weekly") {
        let current_date = new Date()
        current_date.setDate(1)
        while (current_date <= new Date(end_date)) {
            await new ChecklistBox({
                date: new Date(current_date),
                stage: 'open',
                checklist: checklist._id,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: req.user,
                updated_by: req.user
            }).save()
            current_date.setDate(new Date(current_date).getDate() + 7)
        }
    }
    if (frequency == "monthly") {
        let current_date = new Date()
        current_date.setDate(1)
        while (current_date <= new Date(end_date)) {
            await new ChecklistBox({
                date: new Date(current_date),
                stage: 'open',
                checklist: checklist._id,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: req.user,
                updated_by: req.user
            }).save()
            current_date.setMonth(new Date(current_date).getMonth() + 1)
        }
    }
    if (frequency == "yearly") {
        let current_date = new Date()
        current_date.setDate(1)
        while (current_date <= new Date(end_date)) {
            await new ChecklistBox({
                date: new Date(current_date),
                stage: 'open',
                checklist: checklist._id,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: req.user,
                updated_by: req.user
            }).save()
            current_date.setFullYear(new Date(current_date).getFullYear() + 1)
        }
    }
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
        next_date } = req.body as {next_date:string}
    if (!next_date)
        return res.status(400).json({ message: "please provide all required fields" })

    let id = req.params.id

    let checklist = await Checklist.findById(id)
    if (!checklist)
        return res.status(404).json({ message: 'checklist not exists' })

    await Checklist.findByIdAndUpdate(checklist._id, {
        next_date: new Date(next_date),
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
        for (let i = 0; i < workbook_response.length; i++) {
            let checklist = workbook_response[i]
            let work_title: string | null = checklist.work_title
            let person: string | null = checklist.person
            let category: string | null = checklist.category
            let frequency: string | null = checklist.frequency
            let validated = true

            //important
            if (!work_title) {
                validated = false
                statusText = "required work title"
            }
            if (!person) {
                validated = false
                statusText = "required person"
            }
            if (!frequency) {
                validated = false
                statusText = "required frequency"
            }

            if (await Checklist.findOne({ work_title: work_title.trim().toLowerCase() })) {
                validated = false
                statusText = "checklist already exists"
            }


            if (validated) {
                await new Checklist({
                    work_title,
                    person,
                    frequency,
                    category,
                    created_by: req.user,
                    updated_by: req.user,
                    updated_at: new Date(Date.now()),
                    created_at: new Date(Date.now())
                })
                // .save()
                statusText = "success"
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
    let checklist: any = {
        work_title: "check the work given ",
        category: "payment",
        frequency: 'daily'
    }
    ConvertJsonToExcel([checklist])
    let fileName = "CreateChecklistTemplate.xlsx"
    return res.download("./file", fileName)
}