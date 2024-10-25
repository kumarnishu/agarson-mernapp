import { NextFunction, Request, Response } from "express"
import {  User } from "../models/users/user.model";
import isMongoId from "validator/lib/isMongoId";
import { CreateOrEditDropDownDto, DropDownDto } from "../dtos/common/dropdown.dto";
import moment from "moment";
import xlsx from "xlsx";
import SaveFileOnDisk from "../utils/ExportToExcel";
import { MaintenanceCategory } from "../models/maintainence/maintainence.category.model";
import { CreateMaintenanceFromExcelDto, CreateOrEditMaintenanceDto, GetMaintenanceDto, GetMaintenanceItemDto, GetMaintenanceItemRemarkDto, GetMaintenanceReportDto } from "../dtos/maintenance/maintenance.dto";
import { IMaintenance, Maintenance } from "../models/maintainence/maintainence.model";
import { IMaintenanceItem, MaintenanceItem } from "../models/maintainence/maintainence.item.model";
import { Machine } from "../models/production/machine.model";
import { Remark } from "../models/leads/remark.model";
import { CreateOrEditRemarkDto } from "../dtos/crm/crm.dto";


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


export const DeleteMaintenanceCategory = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "category id not valid" })
    let category = await MaintenanceCategory.findById(id);
    if (!category) {
        return res.status(404).json({ message: "category not found" })
    }
    await category.remove();
    return res.status(200).json({ message: "category deleted successfully" })
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
                is_required: true,
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
        await Remark.deleteMany({ maintainable_item: item._id })
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
                frequency: mt.frequency,
                user: { id: mt.user._id, label: mt.user.username, value: mt.user.username },
                items: mt.items.map((mt) => {
                    return {
                        _id: mt._id,
                        item: mt.machine ? mt.machine.name : mt.other,
                        stage: mt.stage,
                        is_required: mt.is_required
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
    let remarks = await Remark.find({ maintainable_item: item })
    result = remarks.map((rem) => {
        return {
            _id: rem._id,
            remark: rem.remark,
            created_at: rem.created_at && moment(rem.created_at).format("DD/MM/YYYY"),
            created_by: rem.created_by.username
        }
    })
    return res.status(200).json(result)
}
export const ViewMaintenanceItemRemarkHistoryByDates = async (req: Request, res: Response, next: NextFunction) => {

    let dt1 = new Date()
    let dt2 = new Date()
    dt2.setDate(new Date(dt2).getDate() + 1)
    dt1.setHours(0)
    dt1.setMinutes(0)
    let result: GetMaintenanceItemRemarkDto[] = []
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "item id not valid" })

    let item = await MaintenanceItem.findById(id)
    if (!item) {
        return res.status(404).json({ message: "item not found" })
    }
    let remarks = await Remark.find({ maintainable_item: item, created_at: { $gte: dt1, $lt: dt2 } })
    result = remarks.map((rem) => {
        return {
            _id: rem._id,
            remark: rem.remark,
            created_at: rem.created_at && moment(rem.created_at).format("DD/MM/YYYY"),
            created_by: rem.created_by.username
        }
    })
    return res.status(200).json(result)
}

export const AddMaintenanceItemRemark = async (req: Request, res: Response, next: NextFunction) => {
    const { remark, stage } = req.body as CreateOrEditRemarkDto
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

    let new_remark = new Remark({
        remark,
        maintainable_item: item,
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
    return res.status(200).json({ message: "new remark added successfully" })
}

export const GetAllMaintenanceReport = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let id = req.query.id
    let maintenances: IMaintenance[] = []
    let count = 0
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let dt1 = new Date(String(start_date))
    dt1.setHours(0)
    dt1.setMinutes(0)
    let dt2 = new Date(String(end_date))
    dt2.setHours(0)
    dt2.setMinutes(0)

    let ids = req.user?.assigned_users.map((id) => { return id._id })
    let result: GetMaintenanceReportDto[] = []

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

        for (let i = 0; i < maintenances.length; i++) {
            let maintenance = maintenances[i]
            let items: GetMaintenanceItemDto[] = []
            for (let j = 0; j < maintenance.items.length; j++) {
                let item = maintenance.items[i];
                let itemboxes = await GetMaintenceItemDates(dt1, dt2, maintenance.frequency, item);
                items.push({
                    _id: item._id,
                    item: item.machine ? item.machine.name : item.other,
                    stage: item.stage,
                    boxes: itemboxes,
                    is_required: item.is_required
                })
            }
            result.push({
                _id: maintenance._id,
                work: maintenance.work,
                active: maintenance.active,
                category: { id: maintenance.category._id, label: maintenance.category.category, value: maintenance.category.category },
                frequency: maintenance.frequency,
                user: { id: maintenance.user._id, label: maintenance.user.username, value: maintenance.user.username },
                items: items,
                created_at: maintenance.created_at.toString(),
                updated_at: maintenance.updated_at.toString(),
                created_by: maintenance.created_by.username,
                updated_by: maintenance.updated_by.username
            })

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

export const GetMaintenceItemBoxes = async (dt1: Date, dt2: Date, frequency: string, item: IMaintenanceItem) => {
    let result: {
        dt1: string,
        dt2: string,
        checked: boolean
    }[] = []

    if (frequency == "daily") {
        let current_date = new Date(dt1)

        while (current_date <= new Date(dt2)) {
            let tmpDate = current_date;
            tmpDate.setDate(new Date(current_date).getDate() + 1)

            let remark = await Remark.findOne({ maintainable_item: item._id, created_at: { $gte: current_date, $lt: tmpDate } });
            result.push({
                dt1: current_date.toString(),
                dt2: tmpDate.toString(),
                checked: remark && item.stage == 'done' ? true : false
            })
            current_date.setDate(new Date(current_date).getDate() + 1)
        }
    }
    if (frequency == "weekly") {
        let current_date = new Date()
        current_date.setDate(1)
        while (current_date <= new Date(dt2)) {
            let tmpDate = current_date;
            tmpDate.setDate(new Date(current_date).getDate() + 6)
            if (current_date >= dt1 && current_date <= dt2) {
                let remark = await Remark.findOne({ maintainable_item: item._id, created_at: { $gte: current_date, $lt: tmpDate } });
                result.push({
                    dt1: current_date.toString(),
                    dt2: tmpDate.toString(),
                    checked: remark && item.stage == 'done' ? true : false
                })
            }

            current_date.setDate(new Date(current_date).getDate() + 6)
        }
    }
    if (frequency === "monthly") {
        let current_date = new Date(dt1); // Start from the first date of the range
        current_date.setDate(1); // Set to the first day of the month

        // Iterate while current_date is less than or equal to dt2
        while (current_date <= new Date(dt2)) {
            // Calculate the next month's date
            let nextMonthDate = new Date(current_date);
            nextMonthDate.setMonth(current_date.getMonth() + 1);

            // Check if the current month is within the specified date range
            if (current_date >= dt1 && current_date < dt2) {
                let remark = await Remark.findOne({
                    maintainable_item: item._id,
                    created_at: { $gte: current_date, $lt: nextMonthDate }
                });

                result.push({
                    dt1: current_date.toString(),
                    dt2: nextMonthDate.toString(),
                    checked: remark && item.stage === 'done' ? true : false
                });
            }

            // Move to the next month
            current_date.setMonth(current_date.getMonth() + 1);
        }
    }

    if (frequency === "yearly") {
        let current_date = new Date(dt1); // Start from the first date of the range
        current_date.setMonth(0); // Set to January (month 0)
        current_date.setDate(1); // Set to the first day of the month

        // Iterate while current_date is less than or equal to dt2
        while (current_date <= new Date(dt2)) {
            // Calculate the next year's date
            let nextYearDate = new Date(current_date);
            nextYearDate.setFullYear(current_date.getFullYear() + 1);

            // Check if the current year is within the specified date range
            if (current_date >= dt1 && current_date < dt2) {
                let remark = await Remark.findOne({
                    maintainable_item: item._id,
                    created_at: { $gte: current_date, $lt: nextYearDate }
                });

                result.push({
                    dt1: current_date.toString(),
                    dt2: nextYearDate.toString(),
                    checked: remark && item.stage === 'done' ? true : false
                });
            }

            // Move to the next year
            current_date.setFullYear(current_date.getFullYear() + 1);
        }
    }

    return result;
}
