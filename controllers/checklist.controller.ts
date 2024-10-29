import { NextFunction, Request, Response } from "express"
import { Asset, User } from "../models/users/user.model";
import isMongoId from "validator/lib/isMongoId";
import { isvalidDate } from "../client/src/utils/isValidDate";
import { Checklist, ChecklistBox, ChecklistCategory, IChecklist } from "../models/checklist/checklist.model";
import { CreateOrEditDropDownDto, DropDownDto } from "../dtos/common/dropdown.dto";
import { CreateOrEditChecklistDto, GetChecklistDto, GetChecklistFromExcelDto } from "../dtos/checklist/checklist.dto";
import { uploadFileToCloud } from "../utils/uploadFileToCloud";
import moment from "moment";
import { destroyFile } from "../utils/destroyCloudFile";
import xlsx from "xlsx";
import SaveFileOnDisk from "../utils/ConvertJsonToExcel";

export const GetAllChecklistCategory = async (req: Request, res: Response, next: NextFunction) => {
    let result = await ChecklistCategory.find();
    let data: DropDownDto[];
    data = result.map((r) => { return { id: r._id, label: r.category, value: r.category } });
    return res.status(200).json(data)
}

export const CreateChecklistCategory = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as CreateOrEditDropDownDto
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

export const UpdateChecklistCategory = async (req: Request, res: Response, next: NextFunction) => {
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
export const DeleteChecklistCategory = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "category id not valid" })
    let category = await ChecklistCategory.findById(id);
    if (!category) {
        return res.status(404).json({ message: "category not found" })
    }
    await category.remove();
    return res.status(200).json({ message: "category deleted successfully" })
}
//get
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
    let ids = req.user?.assigned_users.map((id) => { return id._id })
    let result: GetChecklistDto[] = []

    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        if (req.user?.is_admin && !id) {
            {
                checklists = await Checklist.find().populate('created_by').populate('updated_by').populate('category').populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
                count = await Checklist.find().countDocuments()
            }
        }
        else if (ids && ids.length > 0 && !id) {
            {
                checklists = await Checklist.find({ user: { $in: ids } }).populate('created_by').populate('updated_by').populate('category').populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
                count = await Checklist.find({ user: { $in: ids } }).countDocuments()
            }
        }
        else if (!id) {
            checklists = await Checklist.find({ user: req.user?._id }).populate('created_by').populate('updated_by').populate('category').populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
            count = await Checklist.find({ user: req.user?._id }).countDocuments()
        }

        else {
            checklists = await Checklist.find({ user: id }).populate('created_by').populate('updated_by').populate('category').populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
            count = await Checklist.find({ user: id }).countDocuments()
        }



        for (let i = 0; i < checklists.length; i++) {
            let ch = checklists[i];
            if (ch && ch.category) {
                let boxes = await ChecklistBox.find({ checklist: ch._id, date: { $gte: dt1, $lt: dt2 } }).sort('date');
                let lastcheckedbox = await ChecklistBox.findOne({ checklist: ch._id, checked: true }).sort('-date')

                let dtoboxes = boxes.map((b) => { return { _id: b._id, checked: b.checked, date: b.date.toString(), remarks: b.remarks } });
                result.push({
                    _id: ch._id,
                    work_title: ch.work_title,
                    link: ch.link,
                    end_date: ch.end_date.toString(),
                    category: { id: ch.category._id, label: ch.category.category, value: ch.category.category },
                    frequency: ch.frequency,
                    user: { id: ch.user._id, label: ch.user.username, value: ch.user.username },
                    created_at: ch.created_at.toString(),
                    updated_at: ch.updated_at.toString(),
                    boxes: dtoboxes,
                    done_date: lastcheckedbox ? moment(lastcheckedbox.date).format('DD/MM/YYYY') : "",
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



//post/put/delete/patch
export const CreateChecklist = async (req: Request, res: Response, next: NextFunction) => {

    let body = JSON.parse(req.body.body)
    const { category,
        work_title,
        link,
        user_id,
        next_date,
        frequency,
        end_date } = body as CreateOrEditChecklistDto
    console.log(req.body)
    if (!category || !work_title || !user_id || !frequency || !end_date || !next_date)
        return res.status(400).json({ message: "please provide all required fields" })

    if (!isvalidDate(new Date(end_date)) || new Date(end_date) <= new Date())
        return res.status(400).json({
            message: "please provide valid end date"
        })
    let user = await User.findById(user_id)
    if (!user)
        return res.status(404).json({ message: 'user not exists' })


    let checklist = new Checklist({
        category: category,
        work_title: work_title,
        link: link,
        end_date: new Date(end_date),
        next_date: new Date(next_date),
        user: user._id,
        frequency: frequency,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user,
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

    if (end_date && frequency == "daily") {
        let current_date = new Date()
        current_date.setDate(1)
        while (current_date <= new Date(end_date)) {
            await new ChecklistBox({
                date: new Date(current_date),
                checked: false,
                checklist: checklist._id,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: req.user,
                updated_by: req.user
            }).save()
            current_date.setDate(new Date(current_date).getDate() + 1)
        }
    }
    if (end_date && frequency == "weekly") {
        let current_date = new Date()
        current_date.setDate(1)
        while (current_date <= new Date(end_date)) {
            await new ChecklistBox({
                date: new Date(current_date),
                checked: false,
                checklist: checklist._id,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: req.user,
                updated_by: req.user
            }).save()
            current_date.setDate(new Date(current_date).getDate() + 6)
        }
    }
    return res.status(201).json({ message: `new Checklist added` });
}

export const EditChecklist = async (req: Request, res: Response, next: NextFunction) => {

    let body = JSON.parse(req.body.body)
    const {
        work_title,
        link,
        user_id, next_date } = body as CreateOrEditChecklistDto
    if (!work_title || !user_id)
        return res.status(400).json({ message: "please provide all required fields" })

    let id = req.params.id

    let checklist = await Checklist.findById(id)
    if (!checklist)
        return res.status(404).json({ message: 'checklist not exists' })

    if (user_id) {
        let user = await User.findById(user_id)
        if (user)
            checklist.user = user
    }
    checklist.work_title = work_title
    checklist.link = link
    let document: Asset = undefined
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
                await destroyFile(checklist.photo._id)
        }
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }
    checklist.photo = document;
    if (next_date)
        checklist.next_date = new Date(next_date);
    await checklist.save()
    return res.status(200).json({ message: `Checklist updated` });
}


export const DeleteChecklist = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: " id not valid" })

    let checklist = await Checklist.findById(id)
    if (!checklist) {
        return res.status(404).json({ message: "Checklist not found" })
    }
    await ChecklistBox.deleteMany({ checklist: checklist._id })
    await checklist.remove()

    if (checklist.photo && checklist.photo?._id)
        await destroyFile(checklist.photo._id)

    return res.status(200).json({ message: `Checklist deleted` });
}


export const ToogleChecklist = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const { remarks } = req.body
    if (!isMongoId(id)) return res.status(400).json({ message: " id not valid" })

    let checklist = await ChecklistBox.findById(id)
    if (!checklist) {
        return res.status(404).json({ message: "Checklist box not found" })
    }
    await ChecklistBox.findByIdAndUpdate(id, { checked: !checklist.checked, remarks: remarks })
    return res.status(200).json("successfully marked")
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
        frequency:'daily'
    }
    SaveFileOnDisk([checklist])
    let fileName = "CreateChecklistTemplate.xlsx"
    return res.download("./file", fileName)
}