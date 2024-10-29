import { NextFunction, Request, Response } from "express"
import { User } from "../models/users/user.model";
import isMongoId from "validator/lib/isMongoId";
import { CreateOrEditDropDownDto, DropDownDto } from "../dtos/common/dropdown.dto";
import moment from "moment";
import xlsx from "xlsx";
import SaveFileOnDisk from "../utils/ConvertJsonToExcel";
import { MaintenanceCategory } from "../models/maintainence/maintainence.category.model";
import { CreateMaintenanceFromExcelDto, CreateOrEditMaintenanceDto, GetMaintenanceDto,  GetMaintenanceItemRemarkDto } from "../dtos/maintenance/maintenance.dto";
import { IMaintenance, Maintenance } from "../models/maintainence/maintainence.model";
import { IMaintenanceItem, MaintenanceItem } from "../models/maintainence/maintainence.item.model";
import { Machine } from "../models/production/machine.model";
import { CreateOrEditRemarkDto } from "../dtos/crm/crm.dto";
import { MaintenanceRemark } from "../models/maintainence/maintenance.remark.model";

export const GetAllMaintenanceCategory = async (req: Request, res: Response, next: NextFunction) => {
    let result = await MaintenanceCategory.find();
    let data: DropDownDto[];
    data = result.map((r) => { return { id: r._id, label: r.category, value: r.category } });
    return res.status(200).json(data)
}
export const CreateMaintenanceCategory = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as CreateOrEditDropDownDto
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await MaintenanceCategory.findOne({ category: key.toLowerCase() }))
        return res.status(400).json({ message: "already exists this category" })
    let result = await new MaintenanceCategory({
        category: key,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}
export const UpdateMaintenanceCategory = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as {
        key: string,
    }
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldlocation = await MaintenanceCategory.findById(id)
    if (!oldlocation)
        return res.status(404).json({ message: "category not found" })
    console.log(key, oldlocation.category)
    if (key !== oldlocation.category)
        if (await MaintenanceCategory.findOne({ category: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this category" })
    oldlocation.category = key
    oldlocation.updated_at = new Date()
    if (req.user)
        oldlocation.updated_by = req.user
    await oldlocation.save()
    return res.status(200).json(oldlocation)

}
export const ToogleMaintenanceCategory = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "category id not valid" })
    let category = await MaintenanceCategory.findById(id);
    if (!category) {
        return res.status(404).json({ message: "category not found" })
    }
    category.active = !category.active;
    await category.save();
    return res.status(200).json({ message: "category status changed successfully" })
}
export const CreateMaintenance = async (req: Request, res: Response, next: NextFunction) => {

    let body = JSON.parse(req.body.body)
    const {
        work,
        category,
        user,
        maintainable_item,
        frequency
    } = body as CreateOrEditMaintenanceDto
    if (!work || !category || !user || !maintainable_item || !frequency)
        return res.status(400).json({ message: "please provide all required fields" })


    let tmpUser = await User.findById(user)
    if (!tmpUser)
        return res.status(404).json({ message: 'user not exists' })


    let maintenance = new Maintenance({
        category: category,
        work: work,
        item: maintainable_item,
        user: tmpUser._id,
        frequency: frequency,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    })


    if (maintainable_item.trim().toLowerCase() == 'machine') {
        let machines = await Machine.find({ active: true })
        let items: IMaintenanceItem[] = []
        for (let i = 0; i < machines.length; i++) {
            let item = new MaintenanceItem({
                machine: machines[i],
                maintenance: maintenance,
                is_required: true,
                stage: "open",
                created_at: new Date(),
                updated_at: new Date(),
                created_by: req.user,
                updated_by: req.user
            })
            items.push(item)
            await item.save()
        }
        maintenance.items = items;
    }
    else {
        let item = new MaintenanceItem({
            other: maintainable_item.trim().toLowerCase(),
            is_required: true,
            maintenance: maintenance,
            stage: "open",
            created_at: new Date(),
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        })
        maintenance.items = [item]
        await item.save()

    }
    await maintenance.save()
    return res.status(201).json({ message: `new maintenance added` });
}
export const UpdateMaintenance = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body)
    const {
        work,
        category,
        user,
        frequency
    } = body as CreateOrEditMaintenanceDto
    console.log(req.body)
    if (!work || !category || !user || !frequency)
        return res.status(400).json({ message: "please provide all required fields" })

    let id = req.params.id

    let maintenance = await Maintenance.findById(id)
    if (!maintenance)
        return res.status(404).json({ message: 'maintenance not exists' })

    let tmpUser = await User.findById(user)
    if (!tmpUser)
        return res.status(404).json({ message: 'user not exists' })

    await Maintenance.findByIdAndUpdate(id, {
        work,
        category,
        user: tmpUser,
        frequency,
        updated_at: new Date(),
        updated_by: req.user
    })
    await maintenance.save()
    return res.status(200).json({ message: ` maintenance updated` });
}
export const DeleteMaintenance = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: " id not valid" })

    let maintenance = await Maintenance.findById(id).populate('items')
    if (!maintenance) {
        return res.status(404).json({ message: "Maintenance not found" })
    }
    for (let i = 0; i < maintenance.items.length; i++) {
        let item = maintenance.items[i]
        await MaintenanceItem.findByIdAndDelete(item._id)
        await MaintenanceRemark.deleteMany({ item: item._id })
    }
    await maintenance.remove()
    return res.status(200).json({ message: `Maintenance deleted` });
}
export const GetAllMaintenance = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let id = req.query.id
    let maintenances: IMaintenance[] = []
    let count = 0
    let ids = req.user?.assigned_users.map((id) => { return id._id })
    let result: GetMaintenanceDto[] = []

    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        if (req.user?.is_admin && !id) {
            {
                maintenances = await Maintenance.find({ active: true }).populate('created_by').populate('updated_by').populate('category')
                    .populate({
                        path: 'items',
                        populate: [
                            {
                                path: 'machine',
                                model: 'Machine'
                            }
                        ]
                    })
                    .populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
                count = await Maintenance.find({ active: true }).countDocuments()
            }
        }
        else if (ids && ids.length > 0 && !id) {
            {
                maintenances = await Maintenance.find({ user: { $in: ids }, active: true }).populate('created_by').populate('updated_by').populate('category').populate({
                    path: 'items',
                    populate: [
                        {
                            path: 'machine',
                            model: 'Machine'
                        }
                    ]
                }).populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
                count = await Maintenance.find({ user: { $in: ids }, active: true }).countDocuments()
            }
        }
        else if (!id) {
            maintenances = await Maintenance.find({ user: req.user?._id, active: true }).populate('created_by').populate('updated_by').populate('category').populate({
                path: 'items',
                populate: [
                    {
                        path: 'machine',
                        model: 'Machine'
                    }
                ]
            }).populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
            count = await Maintenance.find({ user: req.user?._id, active: true }).countDocuments()
        }

        else {
            maintenances = await Maintenance.find({ user: id, active: true }).populate('created_by').populate('updated_by').populate('category').populate({
                path: 'items',
                populate: [
                    {
                        path: 'machine',
                        model: 'Machine'
                    }
                ]
            }).populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
            count = await Maintenance.find({ user: id, active: true }).countDocuments()
        }

        result = maintenances.map((mt) => {
            return {
                _id: mt._id,
                work: mt.work,
                active: mt.active,
                category: { id: mt.category._id, label: mt.category.category, value: mt.category.category },
                item: mt.item,
                frequency: mt.frequency,
                user: { id: mt.user._id, label: mt.user.username, value: mt.user.username },
                items: mt.items.map((item) => {
                    return {
                        _id: item._id,
                        item: item.machine ? item.machine.name : item.other,
                        stage: item.stage,
                        is_required: item.is_required
                    }
                }),
                created_at: mt.created_at.toString(),
                updated_at: mt.updated_at.toString(),
                created_by: mt.created_by.username,
                updated_by: mt.updated_by.username
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
export const GetAllMaintenanceReport = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let id = req.query.id
    let maintenances: IMaintenance[] = []
    let count = 0
    let ids = req.user?.assigned_users.map((id) => { return id._id })
    let result: GetMaintenanceDto[] = []

    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        if (req.user?.is_admin && !id) {
            {
                maintenances = await Maintenance.find().populate('created_by').populate('updated_by').populate('category')
                    .populate({
                        path: 'items',
                        populate: [
                            {
                                path: 'machine',
                                model: 'Machine'
                            }
                        ]
                    })
                    .populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
                count = await Maintenance.find().countDocuments()
            }
        }
        else if (ids && ids.length > 0 && !id) {
            {
                maintenances = await Maintenance.find({ user: { $in: ids } }).populate('created_by').populate('updated_by').populate('category').populate({
                    path: 'items',
                    populate: [
                        {
                            path: 'machine',
                            model: 'Machine'
                        }
                    ]
                }).populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
                count = await Maintenance.find({ user: { $in: ids } }).countDocuments()
            }
        }
        else if (!id) {
            maintenances = await Maintenance.find({ user: req.user?._id }).populate('created_by').populate('updated_by').populate('category').populate({
                path: 'items',
                populate: [
                    {
                        path: 'machine',
                        model: 'Machine'
                    }
                ]
            }).populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
            count = await Maintenance.find({ user: req.user?._id }).countDocuments()
        }

        else {
            maintenances = await Maintenance.find({ user: id }).populate('created_by').populate('updated_by').populate('category').populate({
                path: 'items',
                populate: [
                    {
                        path: 'machine',
                        model: 'Machine'
                    }
                ]
            }).populate('user').sort('updated_at').skip((page - 1) * limit).limit(limit)
            count = await Maintenance.find({ user: id }).countDocuments()
        }

        result = maintenances.map((mt) => {
            return {
                _id: mt._id,
                work: mt.work,
                active: mt.active,
                category: { id: mt.category._id, label: mt.category.category, value: mt.category.category },
                item: mt.item,
                frequency: mt.frequency,
                user: { id: mt.user._id, label: mt.user.username, value: mt.user.username },
                items: mt.items.map((item) => {
                    return {
                        _id: item._id,
                        item: item.machine ? item.machine.name : item.other,
                        stage: item.stage,
                        is_required: item.is_required
                    }
                }),
                created_at: mt.created_at.toString(),
                updated_at: mt.updated_at.toString(),
                created_by: mt.created_by.username,
                updated_by: mt.updated_by.username
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
export const CreateMaintenanceFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let result: CreateMaintenanceFromExcelDto[] = []
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
        let workbook_response: CreateMaintenanceFromExcelDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        if (workbook_response.length > 3000) {
            return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
        }
        for (let i = 0; i < workbook_response.length; i++) {
            let maintenance = workbook_response[i]
            let work: string | null = maintenance.work
            let user: string | null = maintenance.user
            let category: string | null = maintenance.category
            let maintainable_item: string | null = maintenance.maintainable_item
            let frequency: string | null = maintenance.frequency
            let validated = true

            //important
            if (!work) {
                validated = false
                statusText = "required work"
            }
            if (!user) {
                validated = false
                statusText = "required person"
            }
            if (!frequency) {
                validated = false
                statusText = "required frequency"
            }
            if (!category) {
                validated = false
                statusText = "required category"
            }
            if (!maintainable_item) {
                validated = false
                statusText = "required maintainable_item"
            }

            if (await Maintenance.findOne({ work: work.trim().toLowerCase() })) {
                validated = false
                statusText = "maintenance already exists"
            }
            let tmpCategory = await MaintenanceCategory.findOne({ category: category.trim().toLowerCase() })
            if (!tmpCategory) {
                validated = false
                statusText = "category not exists"
            }

            let tmpUser = await User.findOne({ username: user.trim().toLowerCase() })
            if (!tmpUser) {
                validated = false
                statusText = "user not exists"
            }


            if (validated) {
                let maintenance = new Maintenance({
                    category: tmpCategory,
                    work: work,
                    item: maintainable_item,
                    user: tmpUser,
                    frequency: frequency,
                    created_at: new Date(),
                    updated_at: new Date(),
                    created_by: req.user,
                    updated_by: req.user
                })


                if (maintainable_item.trim().toLowerCase() == 'machine') {
                    let machines = await Machine.find({ active: true })
                    let items: IMaintenanceItem[] = []
                    for (let i = 0; i < machines.length; i++) {
                        let item = new MaintenanceItem({
                            machine: machines[i],
                            is_required: true,
                            stage: "pending",
                            created_at: new Date(),
                            updated_at: new Date(),
                            created_by: req.user,
                            updated_by: req.user
                        })
                        items.push(item)
                        await item.save()
                    }
                    maintenance.items = items;
                }
                else {
                    let item = new MaintenanceItem({
                        other: maintainable_item.trim().toLowerCase(),
                        is_required: true,
                        stage: "pending",
                        created_at: new Date(),
                        updated_at: new Date(),
                        created_by: req.user,
                        updated_by: req.user
                    })
                    maintenance.items = [item]
                    await item.save()

                }
                await maintenance.save()
                statusText = "success"
            }
            result.push({
                ...maintenance,
                status: statusText
            })
        }
    }
    return res.status(200).json(result);
}
export const DownloadExcelTemplateForMaintenance = async (req: Request, res: Response, next: NextFunction) => {
    let checklist: any = {
        work: "check the work given ",
        category: "ver-1",
        frequency: 'daily',
        user: 'nishu',
        maintainable_item: 'machine'
    }
    SaveFileOnDisk([checklist])
    let fileName = "CreateMaintenanceTemplate.xlsx"
    return res.download("./file", fileName)
}
export const ToogleMaintenanceItem = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: " id not valid" })

    let item = await MaintenanceItem.findById(id)
    if (!item) {
        return res.status(404).json({ message: "item not found" })
    }
    await MaintenanceItem.findByIdAndUpdate(id, { is_required: !item.is_required })
    return res.status(200).json("successfully changed")
}
export const ViewMaintenanceItemRemarkHistory = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetMaintenanceItemRemarkDto[] = []
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "item id not valid" })

    let item = await MaintenanceItem.findById(id)
    if (!item) {
        return res.status(404).json({ message: "item not found" })
    }
    let remarks = await MaintenanceRemark.find({ item: item }).populate('created_by').sort('-created_at')
    result = remarks.map((rem) => {
        return {
            _id: rem._id,
            remark: rem.remark,
            created_at: rem.created_at && moment(rem.created_at).calendar(),
            created_by: rem.created_by.username
        }
    })
    return res.status(200).json(result)
}
export const AddMaintenanceItemRemark = async (req: Request, res: Response, next: NextFunction) => {
    const { remark, stage, maintenance_id } = req.body as CreateOrEditRemarkDto
    if (!remark) return res.status(403).json({ message: "please fill required fields" })

    const user = await User.findById(req.user?._id)
    if (!user)
        return res.status(403).json({ message: "please login to access this resource" })
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "item id not valid" })

    let item = await MaintenanceItem.findById(id)
    if (!item) {
        return res.status(404).json({ message: "item not found" })
    }

    let new_remark = new MaintenanceRemark({
        remark,
        item: item,
        created_at: new Date(Date.now()),
        created_by: req.user,
        updated_at: new Date(Date.now()),
        updated_by: req.user
    })
    await new_remark.save()

    if (stage)
        item.stage = stage;
    if (req.user) {
        item.updated_by = req.user
        item.updated_at = new Date(Date.now())
    }
    await item.save()

    if (!await MaintenanceItem.findOne({ maintenance: maintenance_id, is_required: true, stage: { $ne: 'done' } }))
        await Maintenance.findByIdAndUpdate(maintenance_id, { active: false })
    return res.status(200).json({ message: "new remark added successfully" })
}


