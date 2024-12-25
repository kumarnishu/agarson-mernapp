import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import isMongoId from "validator/lib/isMongoId";
import moment, { isDate } from "moment";
import { Types } from "mongoose";
import { CreateOrEditMergeLeadsDto, GetLeadDto, CreateOrRemoveReferForLeadDto, CreateOrEditLeadDto, GetLeadFromExcelDto } from "../dtos/lead.dto";
import { Bill, IBill } from "../models/crm-bill.model";
import { IRemark, Remark } from "../models/crm-remarks.model";
import { Stage } from "../models/crm-stage.model";
import Lead, { ILead } from "../models/lead.model";
import { IReferredParty, ReferredParty } from "../models/refer.model";
import { User, Asset, IUser } from "../models/user.model";
import { destroyCloudFile } from "../services/destroyCloudFile";
import { uploadFileToCloud } from "../services/uploadFileToCloud";
import { CreateOrEditChecklistRemarkDto, GetChecklistRemarksDto } from "../dtos/checklist-remark.dto";
import { GetChecklistDto, CreateOrEditChecklistDto, GetChecklistFromExcelDto, GroupedChecklistDto } from "../dtos/checklist.dto";
import { CreateOrEditBillDto, GetBillDto } from "../dtos/crm-bill.dto";
import { CreateOrEditRemarkDto, GetRemarksDto, GetActivitiesTopBarDetailsDto, GetActivitiesOrRemindersDto } from "../dtos/crm-remarks.dto";
import { GetDriverSystemDto, CreateOrEditDriverSystemDto, UploadDriverSystemPhotoDto } from "../dtos/driver.dto";
import { GetExpenseItemDto } from "../dtos/expense-item.dto";
import { IssueOrAddExpenseItemDto, GetExpenseTransactionsDto } from "../dtos/expense.dto";
import { CreateOrEditPaymentDocumentDto } from "../dtos/payment-document.dto";
import { GetPaymentDto, CreateOrEditPaymentDto, GetPaymentsFromExcelDto } from "../dtos/payment.dto";
import { GetProductionDto, CreateOrEditProductionDto, GetCategoryWiseProductionReportDto } from "../dtos/production.dto";
import { CreateOrEditMergeRefersDto, GetReferDto, CreateOrEditReferDto, GetReferFromExcelDto } from "../dtos/refer.dto";
import { GetShoeWeightDto, CreateOrEditShoeWeightDto, GetShoeWeightDiffReportDto } from "../dtos/shoe-weight.dto";
import { GetSoleThicknessDto, CreateOrEditSoleThicknessDto } from "../dtos/sole-thickness.dto";
import { GetSpareDyeDto, CreateOrEditSpareDyeDto } from "../dtos/spare-dye.dto";
import { Article } from "../models/article.model";
import { BillItem } from "../models/bill-item.model";
import { ChecklistBox, IChecklistBox } from "../models/checklist-box.model";
import { ChecklistCategory } from "../models/checklist-category.model";
import { ChecklistRemark, IChecklistRemark } from "../models/checklist-remark.model";
import { Checklist, IChecklist } from "../models/checklist.model";
import { IDriverSystem, DriverSystem } from "../models/driver-system.model";
import { DyeLocation } from "../models/dye-location.model";
import { Dye } from "../models/dye.model";
import { ExpenseItem, IExpenseItem } from "../models/expense-item.model";
import { ExpenseLocation } from "../models/expense-location.model";
import { ExpenseTransaction, IExpenseTransaction } from "../models/expense-transaction.model";
import { Machine } from "../models/machine.model";
import { PaymentCategory } from "../models/payment-category.model";
import { PaymentDocument } from "../models/payment-document.model";
import { Payment, IPayment } from "../models/payment.model";
import { IProduction, Production } from "../models/production.model";
import { IShoeWeight, ShoeWeight } from "../models/shoe-weight.model";
import { ISoleThickness, SoleThickness } from "../models/sole-thickness.model";
import { SpareDye, ISpareDye } from "../models/spare-dye.model";
import ConvertJsonToExcel from "../services/ConvertJsonToExcel";
import { getBoxes } from "../utils/checklistHelper";
import { areDatesEqual, previousYear, nextYear, getFirstMonday, parseExcelDate, decimalToTimeForXlsx, hundredDaysAgo } from "../utils/datesHelper";
import { GetDyeStatusReportDto } from "../dtos/dye.dto";
import { IColumnRowData, IRowData } from "../dtos/table.dto";

export class FeatureController {

    public async UpdateChecklistRemark(req: Request, res: Response, next: NextFunction) {
        const { remark } = req.body as CreateOrEditChecklistRemarkDto
        if (!remark) return res.status(403).json({ message: "please fill required fields" })

        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
        let rremark = await ChecklistRemark.findById(id)
        if (!rremark) {
            return res.status(404).json({ message: "remark not found" })
        }
        rremark.remark = remark
        await rremark.save()
        return res.status(200).json({ message: "remark updated successfully" })
    }

    public async DeleteChecklistRemark(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
        let rremark = await ChecklistRemark.findById(id)
        if (!rremark) {
            return res.status(404).json({ message: "remark not found" })
        }
        await rremark.remove()
        return res.status(200).json({ message: " remark deleted successfully" })
    }

    public async GetChecklistBoxRemarkHistory(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(400).json({ message: "id not valid" })
        let box = await ChecklistBox.findById(id);
        if (!box) {
            return res.status(404).json({ message: "box not found" })
        }
        let remarks: IChecklistRemark[] = []
        let result: GetChecklistRemarksDto[] = []
        remarks = await ChecklistRemark.find({ checklist_box: id }).populate('created_by').populate('checklist_box').sort('-created_at')

        result = remarks.map((r) => {
            return {
                _id: r._id,
                remark: r.remark,
                checklist_box: { id: r.checklist_box._id, value: new Date(r.checklist_box.date).toString(), label: new Date(r.checklist_box.date).toString() },
                created_date: r.created_at.toString(),
                created_by: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username }
            }
        })
        return res.json(result)
    }
    public async GetChecklistRemarkHistory(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        let remarks: IChecklistRemark[] = []
        let result: GetChecklistRemarksDto[] = []

        if (!isMongoId(id)) return res.status(400).json({ message: "id not valid" })
        let data = await Checklist.findById(id).populate('checklist_boxes')
        if (!data) {
            return res.status(404).json({ message: "checklist not found" })
        }

        let boxes = data?.checklist_boxes;
        remarks = await ChecklistRemark.find({ checklist_box: boxes }).populate('created_by').sort('-created_at')


        result = remarks.map((r) => {
            return {
                _id: r._id,
                remark: r.remark,
                checklist_box: { id: r.checklist_box._id, value: new Date(r.checklist_box.date).toString(), label: new Date(r.checklist_box.date).toString() },
                created_date: r.created_at.toString(),
                created_by: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username }
            }
        })
        return res.json(result)
    }

    public async NewChecklistRemark(req: Request, res: Response, next: NextFunction) {
        const { remark, stage, checklist, checklist_box, score } = req.body as CreateOrEditChecklistRemarkDto
        if (!remark || !checklist_box || !checklist) return res.status(403).json({ message: "please fill required fields" })

        let box = await ChecklistBox.findById(checklist_box).populate('checklist')
        if (!box) {
            return res.status(404).json({ message: "box not found" })
        }

        let new_remark = new ChecklistRemark({
            remark,
            checklist_box,
            created_at: new Date(Date.now()),
            created_by: req.user,
            updated_at: new Date(Date.now()),
            updated_by: req.user
        })
        if (stage)
            box.stage = stage;
        if (score)
            box.score = score
        await new_remark.save()

        if (req.user) {
            box.updated_by = req.user
            box.updated_at = new Date(Date.now())
        }
        box.last_remark = remark
        await box.save()
        let checklistTmp = await Checklist.findById(box.checklist._id)
        if (stage == 'done') {
            if (checklistTmp) {
                if (checklistTmp.frequency == "daily") {
                    if (areDatesEqual(box.date, new Date())) {
                        checklistTmp.active = false;
                    }
                }
                else {
                    checklistTmp.active = false
                }

            }
        }

        if (checklistTmp) {
            //@ts-ignore
            checklistTmp.lastcheckedbox = stage == "open" ? undefined : box;
            if (stage == "open" && areDatesEqual(box.date, new Date()))
                checklistTmp.active = true
            checklistTmp.updated_by = req.user
            checklistTmp.updated_at = new Date(Date.now())
            checklistTmp.last_remark = remark
            await checklistTmp.save()
        }
        return res.status(200).json({ message: "remark added successfully" })
    }

    public async GetChecklistTopBarDetails(req: Request, res: Response, next: NextFunction) {
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


    public async GetChecklists(req: Request, res: Response, next: NextFunction) {
        let stage = req.query.stage
        let limit = Number(req.query.limit)
        let page = Number(req.query.page)
        let id = req.query.id
        let checklists: IChecklist[] = []
        let count = 0
        let result: GetChecklistDto[] = []
        let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []
        if (!Number.isNaN(limit) && !Number.isNaN(page)) {
            if (req.user?.assigned_users && req.user?.assigned_users.length > 0 && id == 'all') {
                {
                    checklists = await Checklist.find({ assigned_users: { $in: user_ids } }).populate('created_by').populate('updated_by').populate('category').populate('assigned_users').populate('lastcheckedbox').populate('last_10_boxes').sort('serial_no').skip((page - 1) * limit).limit(limit)
                    count = await Checklist.find().countDocuments()

                }
            }
            else if (id == 'all') {
                checklists = await Checklist.find({ assigned_users: req.user?._id }).populate('created_by').populate('updated_by').populate('category').populate('lastcheckedbox').populate('last_10_boxes').populate('assigned_users').sort('serial_no').skip((page - 1) * limit).limit(limit)
                count = await Checklist.find({ assigned_users: req.user?._id }).countDocuments()

            }

            else {
                checklists = await Checklist.find({ assigned_users: id }).populate('created_by').populate('updated_by').populate('category').populate('assigned_users').populate('lastcheckedbox').populate('last_10_boxes').sort('serial_no').skip((page - 1) * limit).limit(limit)
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
                    serial_no: ch.serial_no,
                    last_remark: ch.last_remark,
                    score: 0,
                    work_title: ch.work_title,
                    group_title: ch.group_title,
                    condition: ch.condition,
                    expected_number: ch.expected_number,
                    link: ch.link,
                    last_checked_box: ch.lastcheckedbox && {
                        _id: ch.lastcheckedbox._id,
                        stage: ch.lastcheckedbox.stage,
                        last_remark: ch.lastcheckedbox.last_remark,
                        checklist: { id: ch._id, label: ch.work_title, value: ch.work_title },
                        date: ch.lastcheckedbox.date.toString()
                    },
                    last_10_boxes: ch.last_10_boxes && ch.last_10_boxes.map((bo) => {
                        return {
                            _id: bo._id,
                            stage: bo.stage,
                            last_remark: bo.last_remark,
                            checklist: { id: ch._id, label: ch.work_title, value: ch.work_title },
                            date: bo.date.toString()
                        }
                    }),
                    category: { id: ch.category._id, value: ch.category.category, label: ch.category.category },
                    frequency: ch.frequency,
                    assigned_users: ch.assigned_users.map((u) => { return { id: u._id, value: u.username, label: u.username } }),
                    created_at: ch.created_at.toString(),
                    updated_at: ch.updated_at.toString(),
                    boxes: [],
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
    // public async GetMobileChecklists(req: Request, res: Response, next: NextFunction) {
    //     let checklists: IChecklist[] = []
    //     let result: GetChecklistDto[] = []
    //     let category = req.query.category
    //     let stage = req.query.stage
    //     if (category !== 'all') {
    //         checklists = await Checklist.find({ category: category, assigned_users: req.user?._id }).populate('created_by').populate({
    //             path: 'checklist_boxes',
    //             match: { date: { $gte: previousYear, $lte: nextYear } }, // Filter by date range
    //         }).populate('lastcheckedbox').populate('last_10_boxes').populate('updated_by').populate('category').populate('assigned_users').sort('serial_no')
    //     }
    //     else
    //         checklists = await Checklist.find({ assigned_users: req.user?._id }).populate('created_by').populate({
    //             path: 'checklist_boxes',
    //             match: { date: { $gte: previousYear, $lte: nextYear } }, // Filter by date range
    //         }).populate('lastcheckedbox').populate('last_10_boxes').populate('updated_by').populate('category').populate('assigned_users').sort('serial_no')

    //     if (stage == "open") {
    //         checklists = checklists.filter((ch) => {
    //             return Boolean(!ch.lastcheckedbox)
    //         })
    //     }
    //     if (stage == "pending" || stage == "done") {
    //         checklists = checklists.filter((ch) => {
    //             if (ch.lastcheckedbox)
    //                 return Boolean(ch.lastcheckedbox.stage == stage)
    //         })
    //     }

    //     result = checklists.map((ch) => {
    //         return {
    //             _id: ch._id,
    //             active: ch.active,
    //             serial_no: ch.serial_no,
    //             work_title: ch.work_title,
    //             last_remark: ch.last_remark,
    //             score:0,
    //             group_title: ch.group_title,
    //             link: ch.link,
    //             condition: ch.condition,
    //             expected_number: ch.expected_number,
    //             last_checked_box: ch.lastcheckedbox && {
    //                 _id: ch.lastcheckedbox._id,
    //                 stage: ch.lastcheckedbox.stage,
    //                 last_remark: ch.lastcheckedbox.last_remark,
    //                 checklist: { id: ch._id, label: ch.work_title, value: ch.work_title },
    //                 date: ch.lastcheckedbox.date.toString()
    //             }, last_10_boxes: ch.last_10_boxes && ch.last_10_boxes.map((bo) => {
    //                 return {
    //                     _id: bo._id,
    //                     stage: bo.stage,
    //                     last_remark: bo.last_remark,
    //                     checklist: { id: ch._id, label: ch.work_title, value: ch.work_title },
    //                     date: bo.date.toString()
    //                 }
    //             }),
    //             category: { id: ch.category._id, value: ch.category.category, label: ch.category.category },
    //             frequency: ch.frequency,
    //             assigned_users: ch.assigned_users.map((u) => { return { id: u._id, value: u.username, label: u.username } }),
    //             created_at: ch.created_at.toString(),
    //             updated_at: ch.updated_at.toString(),
    //             boxes: getBoxes(ch, ch.checklist_boxes),
    //             next_date: ch.next_date ? moment(ch.next_date).format("YYYY-MM-DD") : "",
    //             photo: ch.photo?.public_url || "",
    //             created_by: { id: ch.created_by._id, value: ch.created_by.username, label: ch.created_by.username },
    //             updated_by: { id: ch.updated_by._id, value: ch.updated_by.username, label: ch.updated_by.username }
    //         }
    //     })
    //     return res.status(200).json(result)
    // }

    public async GetMobileChecklists(req: Request, res: Response, next: NextFunction) {
        let result: GroupedChecklistDto[] = []
        let groupedChecklists: { group_title: string, checklists: IChecklist[] }[] = []
        let category = req.query.category
        let stage = req.query.stage
        groupedChecklists = await Checklist.aggregate([
            { $match: category !== 'all' ? { category: category, assigned_users: req.user?._id } : { assigned_users: req.user?._id } }
            ,
            {
                $lookup: {
                    from: 'users', // Replace with the actual collection name for users
                    localField: 'created_by',
                    foreignField: '_id',
                    as: 'created_by'
                }
            },
            {
                $lookup: {
                    from: 'checklistcategories', // Replace with the actual collection name for categories
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'updated_by',
                    foreignField: '_id',
                    as: 'updated_by'
                }
            },
            {
                $lookup: {
                    from: 'checklistboxes',
                    localField: 'last_10_boxes',
                    foreignField: '_id',
                    as: 'last_10_boxes'
                }
            },
            {
                $lookup: {
                    from: 'checklistboxes', // Replace with the actual collection name for boxes
                    localField: 'lastcheckedbox',
                    foreignField: '_id',
                    as: 'lastcheckedbox'
                }
            },
            {
                $match: stage === 'open'
                    ? { lastcheckedbox: { $eq: [] } } // No lastcheckedbox
                    : (stage === 'pending' || stage === 'done')
                        ? { 'lastcheckedbox.stage': stage } // Match stage in lastcheckedbox
                        : {}
            },
            {
                $group: {
                    _id: '$group_title', // Grouping by group_title
                    group_title: { $first: '$group_title' }, // Add group title for clarity
                    checklists: { $push: '$$ROOT' } // Push all checklist items into a group
                }
            },
            {
                $sort: { group_title: 1 } // Optional: Sort groups alphabetically by work_title
            }
        ]);


        result = groupedChecklists.map((g) => {
            return {
                group_title: g.group_title,
                checklists: g.checklists.map((ch) => {

                    return {

                        _id: ch._id,
                        active: ch.active,
                        serial_no: ch.serial_no,
                        work_title: ch.work_title,
                        last_remark: ch.last_remark,
                        score: 0,
                        group_title: ch.group_title,
                        link: ch.link,
                        condition: ch.condition,
                        expected_number: ch.expected_number,
                        last_checked_box: ch.lastcheckedbox && {
                            _id: ch.lastcheckedbox._id,
                            stage: ch.lastcheckedbox.stage,
                            last_remark: ch.lastcheckedbox.last_remark,
                            checklist: { id: ch._id, label: ch.work_title, value: ch.work_title },
                            date: new Date(ch.lastcheckedbox.date).toString()
                        },//@ts-ignore
                        boxes: ch.last_10_boxes && ch.last_10_boxes.sort((a, b) => new Date(a.date) - new Date(b.date)).map((bo) => {
                            return {
                                _id: bo._id,
                                stage: bo.stage,
                                last_remark: bo.last_remark,
                                checklist: { id: ch._id, label: ch.work_title, value: ch.work_title },
                                date: bo.date.toString()
                            }
                        }),
                        category: { id: ch.category._id, value: ch.category.category, label: ch.category.category },
                        frequency: ch.frequency,
                        assigned_users: ch.assigned_users.map((u) => { return { id: u._id, value: u.username, label: u.username } }),
                        created_at: ch.created_at.toString(),
                        updated_at: ch.updated_at.toString(),//@ts-ignore
                        last_10_boxes: ch.last_10_boxes && ch.last_10_boxes.sort((a, b) => new Date(a.date) - new Date(b.date)).map((bo) => {
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
            }
        })
        return res.status(200).json(result)
    }
    public async GetChecklistsReport(req: Request, res: Response, next: NextFunction) {
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
        dt1.setHours(0, 0, 0, 0)
        dt2.setHours(0, 0, 0, 0)
        let result: GetChecklistDto[] = []

        if (!Number.isNaN(limit) && !Number.isNaN(page)) {
            if (req.user?.is_admin && id == 'all') {
                {

                    checklists = await Checklist.find().populate('created_by').populate('lastcheckedbox').populate('updated_by').populate('category').populate('assigned_users').populate('last_10_boxes').sort('serial_no').skip((page - 1) * limit).limit(limit)

                    count = await Checklist.find().countDocuments()
                }
            }
            else if (id == 'all') {
                checklists = await Checklist.find({ assigned_users: req.user?._id }).populate('created_by').populate('lastcheckedbox').populate('updated_by').populate('category').populate('last_10_boxes').populate('assigned_users').sort('serial_no').skip((page - 1) * limit).limit(limit)
                count = await Checklist.find({ user: req.user?._id }).countDocuments()
            }

            else {
                checklists = await Checklist.find({ assigned_users: id }).populate('created_by').populate('lastcheckedbox').populate('updated_by').populate('category').populate('last_10_boxes').populate('assigned_users')
                    .populate({
                        path: 'checklist_boxes',
                        match: { date: { $gte: previousYear, $lte: nextYear } }, // Filter by date range
                    })
                    .sort('serial_no').skip((page - 1) * limit).limit(limit)
                count = await Checklist.find({ user: id }).countDocuments()
            }



            if (dt2.getDate() - dt1.getDate() == 1 && id == 'all') {


                result = checklists.map((ch) => {
                    return {
                        _id: ch._id,
                        active: ch.active,
                        work_title: ch.work_title,
                        serial_no: ch.serial_no,
                        group_title: ch.group_title,
                        last_remark: ch.last_remark,
                        score: 0,
                        condition: ch.condition,
                        expected_number: ch.expected_number,
                        link: ch.link,
                        last_checked_box: ch.last_10_boxes[1] && {
                            _id: ch.last_10_boxes[1]._id,
                            stage: ch.last_10_boxes[1].stage,
                            last_remark: ch.last_10_boxes[1].last_remark,
                            checklist: { id: ch._id, label: ch.work_title, value: ch.work_title },
                            date: ch.last_10_boxes[1].date.toString()
                        },
                        category: { id: ch.category._id, value: ch.category.category, label: ch.category.category },
                        frequency: ch.frequency,
                        assigned_users: ch.assigned_users.map((u) => { return { id: u._id, value: u.username, label: u.username } }),
                        created_at: ch.created_at.toString(),
                        updated_at: ch.updated_at.toString(),
                        last_10_boxes: ch.last_10_boxes && ch.last_10_boxes.filter((b) => {
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
                        boxes: ch.last_10_boxes && ch.last_10_boxes.filter((b) => {
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

                if (stage == "open") {
                    result = result.filter((ch) => {
                        return Boolean(ch.last_checked_box?.stage == 'open')
                    })
                }
                if (stage == "pending" || stage == "done") {
                    result = result.filter((ch) => {
                        if (ch.last_checked_box)
                            return Boolean(ch.last_checked_box.stage == stage)
                    })
                }
            }
            else {

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
                        serial_no: ch.serial_no,
                        last_remark: ch.last_remark,
                        score: 0,
                        condition: ch.condition,
                        expected_number: ch.expected_number,
                        group_title: ch.group_title,
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
                        last_10_boxes: ch.last_10_boxes && ch.last_10_boxes.map((bo) => {
                            return {
                                _id: bo._id,
                                stage: bo.stage,
                                last_remark: bo.last_remark,
                                checklist: { id: ch._id, label: ch.work_title, value: ch.work_title },
                                date: bo.date.toString()
                            }
                        }),
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
    public async CreateChecklist(req: Request, res: Response, next: NextFunction) {
        let body = JSON.parse(req.body.body)
        const {
            category,
            work_title,
            serial_no,
            group_title,
            condition,
            expected_number,
            link,
            assigned_users,
            frequency } = body as CreateOrEditChecklistDto

        console.log(req.body)
        if (!category || !work_title || !frequency || !condition)
            return res.status(400).json({ message: "please provide all required fields" })

        let conditions = ['check-blank', 'check_yesno', 'check_expected_number']
        if (!conditions.includes(condition))
            return res.status(400).json({ message: `must be one from given :  ${conditions.toString()}` })


        if (await Checklist.findOne({ serial_no: serial_no })) {
            return res.status(400).json({ message: "serial no already exists" })
        }
        let dt1 = new Date()
        dt1.setHours(0, 0, 0, 0)
        let dt2 = new Date()

        dt2.setDate(dt1.getDate() + 1)
        dt2.setHours(0)
        dt2.setMinutes(0)
        let checklistboxes: IChecklistBox[] = []
        let checklist = new Checklist({
            category: category,
            work_title: work_title,
            serial_no: serial_no,
            condition,
            expected_number,
            group_title: group_title,
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
        checklist.checklist_boxes = checklistboxes;
        await checklist.save();

        let ch = checklist
        let boxes: IChecklistBox[] = []
        if (ch.frequency == 'daily')
            boxes = await ChecklistBox.find({ checklist: checklist, date: { $lt: dt2 } }).sort("-date").limit(5)
        if (ch.frequency == 'monthly')
            boxes = await ChecklistBox.find({ checklist: checklist, date: { $lt: dt2 } }).sort("-date").limit(2)
        if (ch.frequency == 'weekly')
            boxes = await ChecklistBox.find({ checklist: checklist, date: { $lt: dt2 } }).sort("-date").limit(3)
        if (ch.frequency == 'yearly')
            boxes = await ChecklistBox.find({ checklist: checklist, date: { $lt: dt2 } }).sort("-date").limit(2)
        //@ts-ignore
        boxes.sort((a, b) => new Date(a.date) - new Date(b.date));
        ch.last_10_boxes = boxes
        await ch.save()
        return res.status(201).json({ message: `new Checklist added` });
    }
    public async EditChecklist(req: Request, res: Response, next: NextFunction) {

        let body = JSON.parse(req.body.body)
        const {
            category,
            work_title,
            serial_no,
            group_title,
            condition, expected_number,
            link,
            assigned_users } = body as CreateOrEditChecklistDto
        if (!work_title)
            return res.status(400).json({ message: "please provide all required fields" })
        let conditions = ['check-blank', 'check_yesno', 'check_expected_number']
        if (!conditions.includes(condition))
            return res.status(400).json({ message: `must be one from given :  ${conditions.toString()}` })
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
        if (checklist.serial_no !== serial_no)
            if (await Checklist.findOne({ serial_no: serial_no })) {
                return res.status(400).json({ message: "serial no already exists" })
            }
        await Checklist.findByIdAndUpdate(checklist._id, {
            work_title: work_title,
            serial_no: serial_no,
            group_title: group_title,
            category: category,
            condition,
            expected_number,
            link: link,
            assigned_users: assigned_users,
            updated_at: new Date(),
            updated_by: req.user,
            photo: document
        })
        return res.status(200).json({ message: `Checklist updated` });
    }
    public async ChangeNextDate(req: Request, res: Response, next: NextFunction) {

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
    public async DeleteChecklist(req: Request, res: Response, next: NextFunction) {
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
    public async CreateChecklistFromExcel(req: Request, res: Response, next: NextFunction) {
        let result: GetChecklistFromExcelDto[] = []
        let dt1 = new Date()
        dt1.setHours(0, 0, 0, 0)
        let dt2 = new Date()

        dt2.setDate(dt1.getDate() + 1)
        dt2.setHours(0)
        dt2.setMinutes(0)
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
                let serial_no: number | null = checklist.serial_no
                let group_title: string | null = checklist.group_title || ""
                let category: string | null = checklist.category
                let link: string | null = checklist.link
                let frequency: string | null = checklist.frequency
                let condition: string | null = checklist.condition
                let expected_number: number | null = checklist.expected_number
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
                if (!condition) {
                    validated = false
                    statusText = "required condition"
                }
                let conditions = ['check-blank', 'check_yesno', 'check_expected_number']
                if (!conditions.includes(condition)) {
                    validated = false
                    statusText = `must be one from given :  ${conditions.toString()}`
                }
                if (await Checklist.findOne({ serial_no: serial_no })) {
                    validated = false
                    statusText = `serial no ${serial_no} exists`
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
                        let ch = await Checklist.findById(_id)
                        if (ch && ch.serial_no && ch.serial_no !== serial_no)
                            if (await Checklist.findOne({ serial_no: serial_no })) {
                                validated = false
                                statusText = `serial no ${serial_no} exists`
                            }

                        if (validated) {
                            await Checklist.findByIdAndUpdate(checklist._id, {
                                work_title: work_title,
                                serial_no: serial_no,
                                group_title: group_title,
                                condition: condition,
                                expected_number: expected_number,
                                category: category,
                                link: link,
                                assigned_users: users,
                                updated_at: new Date(),
                                updated_by: req.user
                            })
                            statusText = "updated"
                        }
                    }
                    else {
                        let checklist = new Checklist({
                            work_title,
                            group_title,
                            serial_no,
                            condition: condition,
                            expected_number: expected_number,
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
                        let ch = checklist
                        let boxes: IChecklistBox[] = []
                        if (ch.frequency == 'daily')
                            boxes = await ChecklistBox.find({ checklist: checklist, date: { $lt: dt2 } }).sort("-date").limit(5)
                        if (ch.frequency == 'monthly')
                            boxes = await ChecklistBox.find({ checklist: checklist, date: { $lt: dt2 } }).sort("-date").limit(2)
                        if (ch.frequency == 'weekly')
                            boxes = await ChecklistBox.find({ checklist: checklist, date: { $lt: dt2 } }).sort("-date").limit(3)
                        if (ch.frequency == 'yearly')
                            boxes = await ChecklistBox.find({ checklist: checklist, date: { $lt: dt2 } }).sort("-date").limit(2)
                        //@ts-ignore
                        boxes.sort((a, b) => new Date(a.date) - new Date(b.date));
                        ch.last_10_boxes = boxes
                        await ch.save()

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
    public async DownloadExcelTemplateForCreatechecklists(req: Request, res: Response, next: NextFunction) {
        let checklists: GetChecklistFromExcelDto[] = [{
            _id: "umc3m9344343vn934",
            serial_no: 1,
            category: 'maintenance',
            work_title: 'machine work',
            group_title: 'please check all the parts',
            link: 'http://www.bo.agarson.in',
            assigned_users: 'sujata,pawan',
            condition: 'check-blank',// 'check-blank'||'check_yesno'||'check_expected_number
            expected_number: 0,
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
                    serial_no: ch.serial_no,
                    category: ch.category && ch.category.category || "",
                    work_title: ch.work_title,
                    group_title: ch.group_title,
                    condition: ch.condition,
                    expected_number: ch.expected_number,
                    link: ch.link,
                    assigned_users: ch.assigned_users.map((a) => { return a.username }).toString(),
                    frequency: ch.frequency
                }
            })
        let template: { sheet_name: string, data: any[] }[] = []
        template.push({ sheet_name: 'template', data: checklists })
        template.push({ sheet_name: 'categories', data: categories })
        template.push({ sheet_name: 'users', data: users })
        template.push({ sheet_name: 'conditions', data: [{ condition: 'check-blank' }, { condition: 'check_yesno' }, { condition: 'check_expected_number' }] })
        template.push({ sheet_name: 'frequency', data: [{ frequency: "daily" }, { frequency: "weekly" }, { frequency: "monthly" }, { frequency: "yearly" }] })
        ConvertJsonToExcel(template)
        let fileName = "CreateChecklistTemplate.xlsx"
        return res.download("./file", fileName)
    }

    public async AssignChecklistToUsers(req: Request, res: Response, next: NextFunction) {
        const { checklist_ids, user_ids, flag } = req.body as { checklist_ids: string[], user_ids: string[], flag: number }
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
    public async BulkDeleteChecklists(req: Request, res: Response, next: NextFunction) {
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

    public async CreateBill(req: Request, res: Response, next: NextFunction) {
        let body = JSON.parse(req.body.body)
        const {
            items,
            lead,
            refer,
            remarks,
            bill_no,
            bill_date } = body as CreateOrEditBillDto
        console.log(body, bill_no)
        if (!bill_no || !bill_date || !items || !remarks) {
            return res.status(400).json({ message: "please fill all required fields" })
        }
        let bill;
        if (lead) {
            if (await Bill.findOne({ lead: lead, bill_no: bill_no.toLowerCase() }))
                return res.status(400).json({ message: "already exists this bill no" })
            bill = new Bill({
                bill_no, lead: lead, bill_date: new Date(bill_date), remarks,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: req.user,
                updated_by: req.user
            })

        }
        else {
            if (await Bill.findOne({ refer: refer, bill_no: bill_no.toLowerCase() }))
                return res.status(400).json({ message: "already exists this bill no" })

            bill = new Bill({
                bill_no, refer: refer, bill_date: new Date(bill_date), remarks,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: req.user,
                updated_by: req.user
            })
        }
        let document: Asset = undefined
        if (req.file) {
            const allowedFiles = ["image/png", "image/jpeg", "image/gif", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/pdf"];
            const storageLocation = `bills/media`;
            if (!allowedFiles.includes(req.file.mimetype))
                return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
            if (req.file.size > 20 * 1024 * 1024)
                return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
            const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
            if (doc) {
                document = doc
                bill.billphoto = document;
            }
            else {
                return res.status(500).json({ message: "file uploading error" })
            }
        }

        for (let i = 0; i < items.length; i++) {
            let item = items[i]
            await new BillItem({
                article: item.article,
                rate: item.rate,
                qty: item.qty,
                bill: bill._id,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: req.user,
                updated_by: req.user
            }).save()
        }
        await bill.save()
        if (lead) {
            let count = await Bill.find({ lead: lead }).countDocuments()
            await Lead.findByIdAndUpdate(lead, { uploaded_bills: count })
        }
        if (refer) {
            let count = await Bill.find({ refer: refer }).countDocuments()
            await ReferredParty.findByIdAndUpdate(refer, { uploaded_bills: count })
        }
        return res.status(201).json({ message: "success" })

    }

    public async UpdateBill(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id
        let bill = await Bill.findById(id)
        if (!bill)
            return res.status(404).json({ message: "bill not found" })
        let body = JSON.parse(req.body.body)
        const { items, bill_no, bill_date, remarks } = body as CreateOrEditBillDto

        if (!bill_no || !bill_date || !items || !remarks) {
            return res.status(400).json({ message: "please fill all required fields" })
        }

        if (bill.bill_no !== bill_no.toLowerCase())
            if (await Bill.findOne({ bill_no: bill_no.toLowerCase() }))
                return res.status(400).json({ message: "already exists this bill no" })
        let document: Asset = undefined
        if (req.file) {
            const allowedFiles = ["image/png", "image/jpeg", "image/gif", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/pdf"];
            const storageLocation = `bills/media`;
            if (!allowedFiles.includes(req.file.mimetype))
                return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
            if (req.file.size > 20 * 1024 * 1024)
                return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
            const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
            if (doc) {
                document = doc
                if (bill.billphoto)
                    await destroyCloudFile(bill.billphoto._id)
                bill.billphoto = document;
            }
            else {
                return res.status(500).json({ message: "file uploading error" })
            }
        }


        for (let i = 0; i < items.length; i++) {
            let item = items[i]
            let existBill = await BillItem.findById(item._id)
            if (existBill) {
                await BillItem.findByIdAndUpdate(id, {
                    article: item.article,
                    rate: item.rate,
                    qty: item.qty,
                    bill: bill._id,
                    created_at: new Date(),
                    updated_at: new Date(),
                    created_by: req.user,
                    updated_by: req.user
                })
            }
            else {
                await new BillItem({
                    article: item.article,
                    rate: item.rate,
                    qty: item.qty,
                    bill: bill._id,
                    created_at: new Date(),
                    updated_at: new Date(),
                    created_by: req.user,
                    updated_by: req.user
                }).save()
            }

        }
        bill.bill_no = bill_no;
        bill.bill_date = new Date(bill_date);
        bill.remarks = remarks;
        bill.updated_at = new Date();
        if (req.user)
            bill.updated_by = req.user
        await bill.save()
        return res.status(200).json({ message: "updated" })

    }
    public async DeleteBill(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "bill id not valid" })
        let bill = await Bill.findById(id);
        if (!bill) {
            return res.status(404).json({ message: "bill not found" })
        }
        if (bill.billphoto)
            await destroyCloudFile(bill.billphoto._id)
        await bill.remove();
        if (bill.lead) {
            let count = await Bill.find({ lead: bill.lead }).countDocuments()
            await Lead.findByIdAndUpdate(bill.lead, { uploaded_bills: count })
        }
        if (bill.refer) {
            let count = await Bill.find({ refer: bill.refer }).countDocuments()
            await ReferredParty.findByIdAndUpdate(bill.refer, { uploaded_bills: count })
        }
        return res.status(200).json({ message: "bill deleted successfully" })
    }

    public async GetReferPartyBillsHistory(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(400).json({ message: "lead id not valid" })
        let refer = await ReferredParty.findById(id);
        if (!refer) {
            return res.status(404).json({ message: "refer not found" })
        }
        let bills: IBill[] = []
        let result: GetBillDto[] = []
        bills = await Bill.find({ refer: refer._id }).populate('created_by').populate('updated_by').populate('refer').sort('-bill_date')

        for (let i = 0; i < bills.length; i++) {
            let bill = bills[i]
            let billItems = await BillItem.find({ bill: bill._id }).populate('article').sort('-bill_date')
            result.push({
                _id: bill._id,
                bill_no: bill.bill_no,
                refer: { id: refer && refer._id, label: refer && refer.name },
                remarks: bill.remarks,
                billphoto: bill.billphoto?.public_url || "",
                items: billItems.map((i) => {
                    return {
                        _id: i._id,
                        article: i.article._id,
                        qty: i.qty,
                        rate: i.rate
                    }
                }),
                bill_date: bill.bill_date && moment(bill.bill_date).format("DD/MM/YYYY"),
                created_at: bill.created_at,
                updated_at: bill.updated_at,
                created_by: { id: bill.created_by._id, label: bill.created_by.username },
                updated_by: { id: bill.updated_by._id, label: bill.updated_by.username }
            })
        }
        return res.json(result)
    }

    public async GetLeadPartyBillsHistory(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(400).json({ message: "lead id not valid" })
        let lead = await Lead.findById(id);
        if (!lead) {
            return res.status(404).json({ message: "lead not found" })
        }
        let bills: IBill[] = []
        let result: GetBillDto[] = []
        bills = await Bill.find({ lead: lead._id }).populate('created_by').populate('updated_by').populate('lead').sort('-bill_date')

        for (let i = 0; i < bills.length; i++) {
            let bill = bills[i]
            let billItems = await BillItem.find({ bill: bill._id }).populate('article').sort('-bill_date')
            result.push({
                _id: bill._id,
                bill_no: bill.bill_no,
                lead: { id: lead && lead._id, label: lead && lead.name },
                billphoto: bill.billphoto?.public_url || "",
                remarks: bill.remarks,
                items: billItems.map((i) => {
                    return {
                        _id: i._id,
                        article: i.article._id,
                        qty: i.qty,
                        rate: i.rate
                    }
                }),
                bill_date: bill.bill_date && moment(bill.bill_date).format("DD/MM/YYYY"),
                created_at: bill.created_at,
                updated_at: bill.updated_at,
                created_by: { id: bill.created_by._id, label: bill.created_by.username },
                updated_by: { id: bill.updated_by._id, label: bill.updated_by.username }
            })
        }
        return res.json(result)
    }

    public async UpdateRemark(req: Request, res: Response, next: NextFunction) {
        const { remark, remind_date } = req.body as CreateOrEditRemarkDto
        if (!remark) return res.status(403).json({ message: "please fill required fields" })

        const user = await User.findById(req.user?._id)
        if (!user)
            return res.status(403).json({ message: "please login to access this resource" })
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "lead id not valid" })
        let rremark = await Remark.findById(id)
        if (!rremark) {
            return res.status(404).json({ message: "remark not found" })
        }
        rremark.remark = remark
        if (remind_date)
            rremark.remind_date = new Date(remind_date)
        await rremark.save()
        await Lead.findByIdAndUpdate(rremark.lead, { last_remark: remark })
        return res.status(200).json({ message: "remark updated successfully" })
    }

    public async DeleteRemark(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "lead id not valid" })
        let rremark = await Remark.findById(id)
        if (!rremark) {
            return res.status(404).json({ message: "remark not found" })
        }
        await rremark.remove()
        return res.status(200).json({ message: " remark deleted successfully" })
    }

    public async GetReferRemarkHistory(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(400).json({ message: "refer id not valid" })
        let refer = await ReferredParty.findById(id);
        if (!refer) {
            return res.status(404).json({ message: "refer not found" })
        }
        let remarks: IRemark[] = []
        let result: GetRemarksDto[] = []
        remarks = await Remark.find({ refer: refer._id }).populate('created_by').populate('updated_by').sort('-created_at')
        result = remarks.map((r) => {
            return {
                _id: r._id,
                remark: r.remark,
                refer_id: refer?._id,
                refer_name: refer?.name,
                refer_mobile: refer?.mobile,
                remind_date: r.remind_date && moment(r.remind_date).format("DD/MM/YYYY"),
                created_date: moment(r.created_at).format("DD/MM/YYYY"),
                created_by: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username }
            }
        })
        return res.json(result)
    }
    public async GetRemarkHistory(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(400).json({ message: "lead id not valid" })
        let lead = await Lead.findById(id);
        if (!lead) {
            return res.status(404).json({ message: "lead not found" })
        }
        let remarks: IRemark[] = []
        let result: GetRemarksDto[] = []
        remarks = await Remark.find({ lead: lead._id }).populate('created_by').populate('updated_by').populate({
            path: 'lead',
            populate: [
                {
                    path: 'created_by',
                    model: 'User'
                },
                {
                    path: 'updated_by',
                    model: 'User'
                },
                {
                    path: 'referred_party',
                    model: 'ReferredParty'
                }
            ]
        }).sort('-created_at')
        result = remarks.map((r) => {
            return {
                _id: r._id,
                remark: r.remark,
                lead_id: lead?._id,
                lead_name: lead?.name,
                lead_mobile: lead?.mobile,
                remind_date: r.remind_date && moment(r.remind_date).format("DD/MM/YYYY"),
                created_date: moment(r.created_at).format("lll"),
                created_by: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username }
            }
        })
        return res.json(result)
    }

    public async GetActivitiesTopBarDetails(req: Request, res: Response, next: NextFunction) {
        let result: GetActivitiesTopBarDetailsDto[] = []
        let start_date = req.query.start_date
        let id = req.query.id
        let end_date = req.query.end_date
        let dt1 = new Date(String(start_date))
        let dt2 = new Date(String(end_date))
        dt1.setHours(0)
        dt1.setMinutes(0)
        dt2.setHours(0)
        dt2.setMinutes(0)
        let ids = req.user?.assigned_users.map((id: { _id: string }) => { return id._id })
        let stages = await Stage.find();
        let remarks: IRemark[] = []
        if (req.user?.is_admin && !id) {
            remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 } }).populate('lead')

        }

        else if (ids && ids.length > 0 && !id) {
            remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: ids } }).populate('lead')
        }
        else if (!id) {
            remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).populate('lead')
        }
        else {
            remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).populate('lead')
        }
        result.push({
            stage: "Activities", value: remarks.length
        });
        for (let i = 0; i <= stages.length; i++) {
            let stage = stages[i];
            if (stage) {
                let remarkscount = remarks.filter((r) => {
                    if (r.lead && r.lead.stage === stage.stage)
                        return r;
                }).length;
                result.push({
                    stage: stage.stage, value: remarkscount
                });
            }
        }
        return res.status(200).json(result)

    }
    public async GetActivities(req: Request, res: Response, next: NextFunction) {
        let limit = Number(req.query.limit)
        let page = Number(req.query.page)
        let id = req.query.id
        let stage = req.query.stage
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let remarks: IRemark[] = []
        let count = 0
        let dt1 = new Date(String(start_date))
        let dt2 = new Date(String(end_date))
        dt1.setHours(0)
        dt1.setMinutes(0)
        dt2.setHours(0)
        dt2.setMinutes(0)
        let ids = req.user?.assigned_users.map((id: { _id: string }) => { return id._id })
        let result: GetActivitiesOrRemindersDto[] = []

        if (!Number.isNaN(limit) && !Number.isNaN(page)) {
            if (req.user?.is_admin && !id) {
                {
                    remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 } }).populate('created_by').populate('updated_by').populate({
                        path: 'lead',
                        populate: [
                            {
                                path: 'created_by',
                                model: 'User'
                            },
                            {
                                path: 'updated_by',
                                model: 'User'
                            },
                            {
                                path: 'referred_party',
                                model: 'ReferredParty'
                            }
                        ]
                    }).sort('-updated_at').skip((page - 1) * limit).limit(limit)
                    count = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 } }).countDocuments()
                }
            }
            else if (ids && ids.length > 0 && !id) {
                {
                    remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: ids } }).populate('created_by').populate('updated_by').populate({
                        path: 'lead',
                        populate: [
                            {
                                path: 'created_by',
                                model: 'User'
                            },
                            {
                                path: 'updated_by',
                                model: 'User'
                            },
                            {
                                path: 'referred_party',
                                model: 'ReferredParty'
                            }
                        ]
                    }).sort('-updated_at').skip((page - 1) * limit).limit(limit)
                    count = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: ids } }).countDocuments()
                }
            }
            else if (!id) {
                remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).populate('created_by').populate('updated_by').populate({
                    path: 'lead',
                    populate: [
                        {
                            path: 'created_by',
                            model: 'User'
                        },
                        {
                            path: 'updated_by',
                            model: 'User'
                        },
                        {
                            path: 'referred_party',
                            model: 'ReferredParty'
                        }
                    ]
                }).sort('-updated_at').skip((page - 1) * limit).limit(limit)
                count = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).countDocuments()
            }

            else {
                remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).populate('created_by').populate('updated_by').populate({
                    path: 'lead',
                    populate: [
                        {
                            path: 'created_by',
                            model: 'User'
                        },
                        {
                            path: 'updated_by',
                            model: 'User'
                        },
                        {
                            path: 'referred_party',
                            model: 'ReferredParty'
                        }
                    ]
                }).sort('-updated_at').skip((page - 1) * limit).limit(limit)
                count = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).countDocuments()
            }
            if (stage !== 'all') {
                remarks = remarks.filter((r) => {
                    if (r.lead)
                        return r.lead.stage == stage
                })

            }
            result = remarks.map((rem) => {
                return {
                    _id: rem._id,
                    remark: rem.remark,
                    created_at: rem.created_at && moment(rem.created_at).format("LT"),
                    remind_date: rem.remind_date && moment(rem.remind_date).format("DD/MM/YYYY"),
                    created_by: { id: rem.created_by._id, value: rem.created_by.username, label: rem.created_by.username },
                    lead_id: rem.lead && rem.lead._id,
                    name: rem.lead && rem.lead.name,
                    customer_name: rem.lead && rem.lead.customer_name,
                    customer_designation: rem.lead && rem.lead.customer_designation,
                    mobile: rem.lead && rem.lead.mobile,
                    gst: rem.lead && rem.lead.gst,
                    has_card: rem.lead && rem.lead.has_card,
                    email: rem.lead && rem.lead.email,
                    city: rem.lead && rem.lead.city,
                    state: rem.lead && rem.lead.state,
                    country: rem.lead && rem.lead.country,
                    address: rem.lead && rem.lead.address,
                    work_description: rem.lead && rem.lead.work_description,
                    turnover: rem.lead && rem.lead.turnover,
                    alternate_mobile1: rem.lead && rem.lead.alternate_mobile1,
                    alternate_mobile2: rem.lead && rem.lead.alternate_mobile2,
                    alternate_email: rem.lead && rem.lead.alternate_email,
                    lead_type: rem.lead && rem.lead.lead_type,
                    stage: rem.lead && rem.lead.stage,
                    lead_source: rem.lead && rem.lead.lead_source,
                    visiting_card: rem.lead && rem.lead.visiting_card?.public_url || "",
                    referred_party_name: rem.lead && rem.lead.referred_party?.name || "",
                    referred_party_mobile: rem.lead && rem.lead.referred_party?.mobile || "",
                    referred_date: rem.lead && rem.lead.referred_party && moment(rem.lead.referred_date).format("DD/MM/YYYY") || "",

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

    public async NewRemark(req: Request, res: Response, next: NextFunction) {
        const { remark, remind_date, has_card, stage } = req.body as CreateOrEditRemarkDto
        if (!remark) return res.status(403).json({ message: "please fill required fields" })

        const user = await User.findById(req.user?._id)
        if (!user)
            return res.status(403).json({ message: "please login to access this resource" })
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "lead id not valid" })

        let lead = await Lead.findById(id)
        if (!lead) {
            return res.status(404).json({ message: "lead not found" })
        }

        let new_remark = new Remark({
            remark,
            lead: lead,
            created_at: new Date(Date.now()),
            created_by: req.user,
            updated_at: new Date(Date.now()),
            updated_by: req.user
        })
        if (remind_date)
            new_remark.remind_date = new Date(remind_date)
        await new_remark.save()

        if (has_card)
            lead.has_card = true
        else
            lead.has_card = false
        lead.stage = stage
        if (req.user) {
            lead.updated_by = req.user
            lead.updated_at = new Date(Date.now())
            lead.last_remark = remark
        }
        await lead.save()
        return res.status(200).json({ message: "new remark added successfully" })
    }
    public async GetAllDriverSystems(req: Request, res: Response, next: NextFunction) {
        let limit = Number(req.query.limit)
        let page = Number(req.query.page)
        let id = req.query.id
        let start_date = req.query.start_date
        let end_date = req.query.end_date

        let count = 0
        let dt1 = new Date(String(start_date))
        dt1.setHours(0)
        dt1.setMinutes(0)
        let dt2 = new Date(String(end_date))
        dt2.setHours(0)
        dt2.setMinutes(0)

        let result: GetDriverSystemDto[] = []
        let items: IDriverSystem[] = []

        let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []
        if (!Number.isNaN(limit) && !Number.isNaN(page)) {
            if (!id) {


                if (user_ids.length > 0) {
                    items = await DriverSystem.find({ date: { $gte: dt1, $lt: dt2 }, driver: { $in: user_ids } }).populate('driver').populate('created_by').populate('updated_by').sort("-created_at").skip((page - 1) * limit).limit(limit)
                    count = await DriverSystem.find({ date: { $gt: dt1, $lt: dt2 }, driver: { $in: user_ids } }).countDocuments()
                }

                else {

                    items = await DriverSystem.find({ date: { $gte: dt1, $lt: dt2 }, driver: req.user?._id }).populate('driver').populate('created_by').populate('updated_by').sort("-created_at").skip((page - 1) * limit).limit(limit)
                    count = await DriverSystem.find({ date: { $gt: dt1, $lt: dt2 }, driver: req.user?._id }).countDocuments()
                }



            }


            else {
                items = await DriverSystem.find({ date: { $gte: dt1, $lt: dt2 }, driver: id }).populate('driver').populate('created_by').populate('updated_by').sort("-created_at").skip((page - 1) * limit).limit(limit)
                count = await DriverSystem.find({ date: { $gte: dt1, $lt: dt2 }, driver: id }).countDocuments()
            }
            result = items.map((item) => {
                return {
                    _id: item._id,
                    date: moment(item.date).format("DD/MM/YYYY"),
                    driver: { id: item.driver._id, label: item.driver.username, value: item.driver.username },
                    party: item.party,
                    billno: item.billno,
                    marka: item.marka,
                    transport: item.transport,
                    location: item.location,
                    photo: item.photo?.public_url || "",
                    remarks: item.remarks,
                    created_at: moment(new Date()).format("DD/MM/YYYY"),
                    updated_at: moment(new Date()).format("DD/MM/YYYY"),
                    created_by: { id: item.created_by._id, label: item.created_by.username, value: item.created_by.username },
                    updated_by: { id: item.updated_by._id, label: item.updated_by.username, value: item.updated_by.username }
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
            return res.status(200).json({ message: "bad request" })
    }

    public async GetMyDriverSystems(req: Request, res: Response, next: NextFunction) {
        let result: GetDriverSystemDto[] = []
        let items: IDriverSystem[] = []
        items = await DriverSystem.find({ driver: req.user._id }).populate('driver').populate('created_by').populate('updated_by').sort('-created_at')
        result = items.map((item) => {
            return {
                _id: item._id,
                date: moment(item.date).format("DD/MM/YYYY"),
                driver: { id: item.driver._id, label: item.driver.username, value: item.driver.username },
                party: item.party,
                billno: item.billno,
                marka: item.marka,
                transport: item.transport,
                location: item.location,
                photo: item.photo?.public_url || "",
                remarks: item.remarks,
                created_at: moment(new Date()).format("DD/MM/YYYY"),
                updated_at: moment(new Date()).format("DD/MM/YYYY"),
                created_by: { id: item.created_by._id, label: item.created_by.username, value: item.created_by.username },
                updated_by: { id: item.updated_by._id, label: item.updated_by.username, value: item.updated_by.username }
            }
        })
        return res.status(200).json(result)
    }

    public async CreateDriverSystem(req: Request, res: Response, next: NextFunction) {
        const {
            date,
            driver,
            party,
            billno,
            marka,
            transport,
            remarks } = req.body as CreateOrEditDriverSystemDto
        if (!driver || !party || !billno || !marka || !transport) {
            return res.status(400).json({ message: "please provide required fields" })
        }
        let dt1 = new Date()
        let dt2 = new Date()
        dt2.setDate(new Date(dt2).getDate() + 1)
        dt1.setHours(0)
        dt1.setMinutes(0)
        let system = await DriverSystem.findOne({ party: party.toLowerCase(), transport: transport.trim().toLowerCase(), date: { $gte: dt1, $lt: dt2 } })
        if (system && system.transport !== transport.trim().toLowerCase())
            return res.status(400).json({ message: "transport change occurred, already exists one record for that party with different transport" })

        let result = await new DriverSystem({
            date, driver, party, billno, marka, transport, remarks,
            created_at: new Date(),
            created_by: req.user,
            updated_at: new Date(),
            updated_by: req.user
        }).save()
        return res.status(201).json(result)

    }

    public async UpdateDriverSystem(req: Request, res: Response, next: NextFunction) {
        const {
            date,
            driver,
            party,
            billno,
            marka,
            transport,
            remarks } = req.body as CreateOrEditDriverSystemDto
        if (!driver || !party || !billno || !marka || !transport) {
            return res.status(400).json({ message: "please provide required fields" })
        }
        const id = req.params.id
        let olditem = await DriverSystem.findById(id)
        if (!olditem)
            return res.status(404).json({ message: "item not found" })
        let dt1 = new Date()
        let dt2 = new Date()
        dt2.setDate(new Date(dt2).getDate() + 1)
        dt1.setHours(0)
        dt1.setMinutes(0)

        let system = await DriverSystem.findOne({ party: party.toLowerCase(), transport: transport.trim().toLowerCase(), date: { $gte: dt1, $lt: dt2 } })
        if (system && system.transport !== transport.trim().toLowerCase())
            return res.status(400).json({ message: "transport change occurred, already exists one record for that party with different transport" })

        await DriverSystem.findByIdAndUpdate(id, {
            date,
            driver,
            party,
            billno,
            marka,
            transport,
            remarks, updated_at: new Date(),
            updated_by: req.user
        })
        return res.status(200).json(olditem)

    }
    public async DeleteDriverSystem(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "item id not valid" })
        let item = await DriverSystem.findById(id);
        if (!item) {
            return res.status(404).json({ message: "item not found" })
        }

        await DriverSystem.findByIdAndDelete(id);

        return res.status(200).json({ message: "item deleted successfully" })
    }


    public async UploadDriverSystemPhoto(req: Request, res: Response, next: NextFunction) {
        let body = JSON.parse(req.body.body)
        console.log(body)
        console.log(req.file)
        let { latitude, longitude, remark } = body as UploadDriverSystemPhotoDto
        if (!latitude || !longitude) {
            return res.status(400).json({ message: "please fill all required fields" })
        }

        if (!req.file) {
            return res.status(400).json({ message: "please upload document" })
        }

        const id = req.params.id
        let system = await DriverSystem.findById(id)
        if (!system)
            return res.status(404).json({ message: "item not found" })

        if (req.file) {
            console.log(req.file.mimetype)
            const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
            const storageLocation = `driverapp/media`;
            if (!allowedFiles.includes(req.file.mimetype))
                return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
            if (req.file.size > 20 * 1024 * 1024)
                return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
            const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
            if (doc)
                system.photo = doc
            else {
                return res.status(500).json({ message: "file uploading error" })
            }
        }
        system.updated_at = new Date()

        if (req.user)
            system.updated_by = req.user

        let address = await (await fetch(`https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&&api_key=${process.env.GECODE_API_KEY}`)).json()

        system.location = address || ""
        await system.save()
        return res.status(201).json(system)
    }




    public async IssueExpenseItem(req: Request, res: Response, next: NextFunction) {
        const { stock, location, remark } = req.body as IssueOrAddExpenseItemDto
        if (!remark || !location) {
            return res.status(400).json({ message: "please fill all required fields" })
        }
        const id = req.params.id
        let olditem = await ExpenseItem.findById(id)
        if (!olditem)
            return res.status(404).json({ message: "item not found" })
        if (olditem.to_maintain_stock && stock == 0)
            return res.status(404).json({ message: "stock should be more than 0" })
        let store = await ExpenseLocation.findOne({ name: "store" })
        if (!store)
            return res.status(404).json({ messgae: "store not exists" })
        await ExpenseItem.findByIdAndUpdate(id, {
            stock: olditem.stock - stock || 0,
            last_remark: remark,
            updated_at: new Date(),
            updated_by: req.user
        })

        await new ExpenseTransaction({
            item: olditem,
            location: store,
            remark: remark,
            outWardQty: stock,
            inWardQty: 0,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
        await new ExpenseTransaction({
            item: olditem,
            location: location,
            remark: remark,
            outWardQty: 0,
            inWardQty: stock,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
        return res.status(200).json(olditem)
    }

    public async AddExpenseItem(req: Request, res: Response, next: NextFunction) {
        const { stock, location, remark } = req.body as IssueOrAddExpenseItemDto
        console.log(req.body)
        if (!location || !remark) {
            return res.status(400).json({ message: "please fill all required fields" })
        }
        const id = req.params.id
        let olditem = await ExpenseItem.findById(id)
        if (!olditem)
            return res.status(404).json({ message: "item not found" })
        if (!olditem.to_maintain_stock) {
            return res.status(404).json({ message: "not allowed to add stock" })
        }
        if (stock <= 0)
            return res.status(400).json({ message: "provide stock" })
        let store = await ExpenseLocation.findOne({ name: "store" })
        if (!store)
            return res.status(404).json({ messgae: "store not exists" })

        await ExpenseItem.findByIdAndUpdate(id, {
            stock: Number(olditem.stock) + Number(stock || 0),
            updated_at: new Date(), last_remark: remark,
            updated_by: req.user
        })
        await new ExpenseTransaction({
            item: olditem,
            location: store,
            remark: remark,
            outWardQty: 0,
            inWardQty: stock || 0,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
        await new ExpenseTransaction({
            item: olditem,
            location: location,
            remark: remark,
            outWardQty: stock || 0,
            inWardQty: 0,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
        return res.status(200).json(olditem)
    }

    public async GetAllExpenseStore(req: Request, res: Response, next: NextFunction) {
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

    public async GetAllExpenseTransactions(req: Request, res: Response, next: NextFunction) {
        let result: GetExpenseTransactionsDto[] = []
        let items: IExpenseTransaction[] = []
        items = await ExpenseTransaction.find().populate({
            path: 'item',
            populate: [
                {
                    path: 'unit',
                    model: 'ItemUnit'
                },
                {
                    path: 'category',
                    model: 'ExpenseCategory'
                }
            ]
        }).populate('created_by').populate('location').sort('-created_at')

        result = items.map((item) => {
            return {
                _id: item._id,
                item: { id: item.item._id, label: item.item.item, value: item.item.item },
                category: { id: item.item.category._id, label: item.item.category.category },
                unit: { id: item.item.unit._id, label: item.item.unit.unit },
                price: item.item.price,
                location: { id: item.location._id, label: item.location.name, value: item.location.name },
                remark: item.remark,
                inWardQty: item.inWardQty,
                outWardQty: item.outWardQty,
                created_by: { id: item.created_by._id, label: item.created_by.username, value: item.item.created_by.username },
                created_at: moment(new Date()).format("llll")
            }
        })
        return res.status(200).json(result)
    }


    public async MergeTwoLeads(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        const { name, mobiles, city, stage, state, email, alternate_email, address, merge_refer, merge_bills, merge_remarks, source_lead_id } = req.body as CreateOrEditMergeLeadsDto
        let lead = await Lead.findById(id);
        let sourcelead = await Lead.findById(source_lead_id);

        if (!lead || !sourcelead)
            return res.status(404).json({ message: "leads not found" })

        await Lead.findByIdAndUpdate(id, {
            name: name,
            city: city,
            state: state,
            mobile: mobiles[0] || null,
            alternate_mobile1: mobiles[1] || null,
            alternate_mobile2: mobiles[2] || null,
            stage: stage,
            email: email,
            alternate_email: alternate_email,
            address: address
        });

        if (merge_refer) {
            let refer = await ReferredParty.findById(sourcelead.referred_party);
            if (refer) {
                lead.referred_party = refer;
                lead.referred_date = sourcelead.referred_date;
                await lead.save();
            }
        }
        if (merge_remarks) {
            await Remark.updateMany({ lead: source_lead_id }, { lead: id });
        }
        if (merge_bills) {
            await Bill.updateMany({ lead: source_lead_id }, { lead: id });
        }
        await Lead.findByIdAndDelete(source_lead_id);
        return res.status(200).json({ message: "merge leads successfully" })
    }
    public async GetAssignedReferrals(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id
        if (!isMongoId(id))
            return res.status(400).json({ message: "bad mongo id" })
        let party = await ReferredParty.findById(id)

        if (!party)
            return res.status(404).json({ message: "party not found" })
        let leads: ILead[]
        let result: GetLeadDto[] = []
        leads = await Lead.find({ referred_party: party._id }).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')


        result = leads.map((lead) => {
            return {
                _id: lead._id,
                name: lead.name,
                customer_name: lead.customer_name,
                uploaded_bills: lead.uploaded_bills,
                customer_designation: lead.customer_designation,
                mobile: lead.mobile,
                gst: lead.gst,
                has_card: lead.has_card,
                email: lead.email,
                city: lead.city,
                state: lead.state,
                country: lead.country,
                address: lead.address,
                work_description: lead.work_description,
                turnover: lead.turnover,
                alternate_mobile1: lead.alternate_mobile1,
                alternate_mobile2: lead.alternate_mobile2,
                alternate_email: lead.alternate_email,
                lead_type: lead.lead_type,
                stage: lead.stage,
                lead_source: lead.lead_source,
                visiting_card: lead.visiting_card?.public_url || "",
                referred_party_name: lead.referred_party && lead.referred_party.name,
                referred_party_mobile: lead.referred_party && lead.referred_party.mobile,
                referred_date: lead.referred_party && moment(lead.referred_date).format("DD/MM/YYYY"),
                last_remark: lead?.last_remark || "",
                created_at: moment(lead.created_at).format("DD/MM/YYYY"),
                updated_at: moment(lead.updated_at).format("DD/MM/YYYY"),
                created_by: { id: lead.created_by._id, value: lead.created_by.username, label: lead.created_by.username },
                updated_by: { id: lead.updated_by._id, value: lead.updated_by.username, label: lead.updated_by.username },
            }
        })

        return res.status(200).json(result);
    }

    public async GetLeads(req: Request, res: Response, next: NextFunction) {
        let limit = Number(req.query.limit)
        let page = Number(req.query.page)
        let stage = req.query.stage
        let user = await User.findById(req.user).populate('assigned_crm_states').populate('assigned_crm_cities');
        let showonlycardleads = Boolean(user?.assigned_permissions.includes('show_leads_having_cards_only'))
        let result: GetLeadDto[] = []
        let states = user?.assigned_crm_states.map((item) => { return item.state })
        let cities = user?.assigned_crm_cities.map((item) => { return item.city })
        let stages = await (await Stage.find()).map((i) => { return i.stage })
        if (!req.user?.assigned_permissions.includes('show_leads_useless'))
            stages = stages.filter((stage) => { return stage !== "useless" })
        if (!req.user?.assigned_permissions.includes('show_refer_leads'))
            stages = stages.filter((stage) => { return stage !== "refer" })
        if (!Number.isNaN(limit) && !Number.isNaN(page)) {
            let leads: ILead[] = []
            let count = 0
            if (stage != "all") {
                leads = await Lead.find({
                    stage: stage, state: { $in: states }, city: { $in: cities }
                }).populate('updated_by').populate('referred_party').populate('created_by').sort('created_at').skip((page - 1) * limit).limit(limit)
                count = await Lead.find({
                    stage: stage, state: { $in: states }, city: { $in: cities }
                }).countDocuments()
            }
            else if (showonlycardleads) {
                leads = await Lead.find({
                    has_card: showonlycardleads, state: { $in: states }, city: { $in: cities }
                }).populate('updated_by').populate('referred_party').populate('created_by').sort('created_at').skip((page - 1) * limit).limit(limit)
                count = await Lead.find({
                    has_card: showonlycardleads, state: { $in: states }, city: { $in: cities }
                }).countDocuments()
            }
            else {
                leads = await Lead.find({
                    stage: { $in: stages }, state: { $in: states }, city: { $in: cities }
                }).populate('updated_by').populate('referred_party').populate('created_by').sort('created_at').skip((page - 1) * limit).limit(limit)
                count = await Lead.find({
                    stage: { $in: stages }, state: { $in: states }, city: { $in: cities }
                }).countDocuments()
            }

            result = leads.map((lead) => {
                return {
                    _id: lead._id,
                    name: lead.name,
                    customer_name: lead.customer_name,
                    customer_designation: lead.customer_designation,
                    mobile: lead.lead_type == "company" ? "" : lead.mobile,
                    gst: lead.gst,
                    has_card: lead.has_card,
                    email: lead.email,
                    city: lead.city,
                    state: lead.state,
                    uploaded_bills: lead.uploaded_bills || 0,
                    country: lead.country,
                    address: lead.address,
                    work_description: lead.work_description,
                    turnover: lead.turnover,
                    alternate_mobile1: lead.lead_type == "company" ? "" : lead.alternate_mobile1,
                    alternate_mobile2: lead.lead_type == "company" ? "" : lead.alternate_mobile2,
                    alternate_email: lead.alternate_email,
                    lead_type: lead.lead_type,
                    stage: lead.stage,
                    lead_source: lead.lead_source,
                    visiting_card: lead.visiting_card?.public_url || "",
                    referred_party_name: lead.referred_party && lead.referred_party.name,
                    referred_party_mobile: lead.referred_party && lead.referred_party.mobile,
                    referred_date: lead.referred_party && moment(lead.referred_date).format("DD/MM/YYYY"),
                    last_remark: lead.last_remark || "",
                    created_at: moment(lead.created_at).format("DD/MM/YYYY"),
                    updated_at: moment(lead.updated_at).format("DD/MM/YYYY"),
                    created_by: { id: lead.created_by._id, value: lead.created_by.username, label: lead.created_by.username },
                    updated_by: { id: lead.updated_by._id, value: lead.updated_by.username, label: lead.updated_by.username },
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
    public async ReferLead(req: Request, res: Response, next: NextFunction) {
        const { party_id, remark, remind_date } = req.body as CreateOrRemoveReferForLeadDto
        if (!party_id)
            return res.status(400).json({ message: "fill required field" })
        const id = req.params.id
        if (!isMongoId(id) || !isMongoId(party_id))
            return res.status(400).json({ message: "bad mongo id" })
        let lead = await Lead.findById(id)
        if (!lead)
            return res.status(404).json({ message: "lead not found" })
        let party = await ReferredParty.findById(party_id)
        if (!party)
            return res.status(404).json({ message: "referred party not found" })

        if (remark) {
            let new_remark = new Remark({
                remark,
                lead: lead,
                created_at: new Date(),
                created_by: req.user,
                updated_at: new Date(),
                updated_by: req.user
            })
            if (remind_date)
                new_remark.remind_date = new Date(remind_date)
            await new_remark.save()
        }

        lead.referred_party = party
        lead.stage = "refer"
        lead.last_remark = remark;
        lead.referred_date = new Date()
        lead.updated_at = new Date()
        if (req.user)
            lead.updated_by = req.user
        await lead.save()
        return res.status(200).json({ message: "party referred successfully" })
    }

    public async RemoveLeadReferral(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id
        const { remark } = req.body as CreateOrRemoveReferForLeadDto
        if (!isMongoId(id))
            return res.status(400).json({ message: "bad mongo id" })
        let lead = await Lead.findById(id)
        if (!lead)
            return res.status(404).json({ message: "lead not found" })
        if (remark) {
            let new_remark = new Remark({
                remark,
                lead: lead,
                created_at: new Date(),
                created_by: req.user,
                updated_at: new Date(),
                updated_by: req.user
            })
            await new_remark.save()
        }
        lead.referred_party = undefined
        lead.referred_date = undefined
        lead.stage = "open"
        lead.last_remark = remark;
        lead.updated_at = new Date()
        if (req.user)
            lead.updated_by = req.user
        await lead.save()
        return res.status(200).json({ message: "referrals removed successfully" })
    }


    public async ConvertLeadToRefer(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "lead id not valid" })
        let lead = await Lead.findById(id);
        if (!lead) {
            return res.status(404).json({ message: "lead not found" })
        }
        const { remark } = req.body
        let resultParty = await ReferredParty.findOne({ mobile: lead.mobile });
        if (resultParty) {
            return res.status(400).json({ message: "already exists this mobile number in refers" })
        }

        const refer = await new ReferredParty({
            name: lead.name, customer_name: lead.customer_name, city: lead.city, state: lead.state,
            mobile: lead.mobile,
            mobile2: lead.alternate_mobile1 || undefined,
            mobile3: lead.alternate_mobile2 || undefined,
            address: lead.address,
            gst: "erertyujhtyuiop",
            convertedfromlead: true,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        })
        await Remark.updateMany({ lead: lead._id }, { lead: undefined, refer: refer._id });
        refer.last_remark = remark
        await refer.save()
        await Lead.findByIdAndDelete(lead._id);
        if (remark)
            await new Remark({
                remark: remark,
                refer: refer,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: req.user,
                updated_by: req.user
            }).save()
        return res.status(200).json({ message: "new refer created" })
    }


    public async FuzzySearchLeads(req: Request, res: Response, next: NextFunction) {
        let limit = Number(req.query.limit)
        let page = Number(req.query.page)
        let result: GetLeadDto[] = []
        let user = await User.findById(req.user).populate('assigned_crm_states').populate('assigned_crm_cities');
        let showonlycardleads = Boolean(user?.assigned_permissions.includes('show_leads_having_cards_only'))
        let states = user?.assigned_crm_states.map((item) => { return item.state })
        let cities = user?.assigned_crm_cities.map((item) => { return item.city })
        let key = String(req.query.key).split(",")
        let stage = req.query.stage
        if (!key)
            return res.status(500).json({ message: "bad request" })
        let leads: ILead[] = []
        if (!Number.isNaN(limit) && !Number.isNaN(page)) {

            if (stage != "all") {
                if (key.length == 1 || key.length > 4) {

                    leads = await Lead.find({
                        stage: stage, state: { $in: states }, city: { $in: cities },
                        $or: [
                            { name: { $regex: key[0], $options: 'i' } },
                            { customer_name: { $regex: key[0], $options: 'i' } },
                            { customer_designation: { $regex: key[0], $options: 'i' } },
                            { gst: { $regex: key[0], $options: 'i' } },
                            { mobile: { $regex: key[0], $options: 'i' } },
                            { email: { $regex: key[0], $options: 'i' } },
                            { country: { $regex: key[0], $options: 'i' } },
                            { address: { $regex: key[0], $options: 'i' } },
                            { work_description: { $regex: key[0], $options: 'i' } },
                            { turnover: { $regex: key[0], $options: 'i' } },
                            { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                            { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                            { alternate_email: { $regex: key[0], $options: 'i' } },
                            { lead_type: { $regex: key[0], $options: 'i' } },
                            { lead_source: { $regex: key[0], $options: 'i' } },
                            { last_remark: { $regex: key[0], $options: 'i' } },
                            { city: { $regex: key[0], $options: 'i' } },
                            { state: { $regex: key[0], $options: 'i' } },
                        ]

                    }
                    ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')
                }
                if (key.length == 2) {

                    leads = await Lead.find({
                        stage: stage, state: { $in: states }, city: { $in: cities },
                        $and: [
                            {
                                $or: [
                                    { name: { $regex: key[0], $options: 'i' } },
                                    { customer_name: { $regex: key[0], $options: 'i' } },
                                    { customer_designation: { $regex: key[0], $options: 'i' } },
                                    { gst: { $regex: key[0], $options: 'i' } },
                                    { mobile: { $regex: key[0], $options: 'i' } },
                                    { email: { $regex: key[0], $options: 'i' } },
                                    { country: { $regex: key[0], $options: 'i' } },
                                    { address: { $regex: key[0], $options: 'i' } },
                                    { work_description: { $regex: key[0], $options: 'i' } },
                                    { turnover: { $regex: key[0], $options: 'i' } },
                                    { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                    { alternate_email: { $regex: key[0], $options: 'i' } },
                                    { lead_type: { $regex: key[0], $options: 'i' } },
                                    { lead_source: { $regex: key[0], $options: 'i' } },
                                    { last_remark: { $regex: key[0], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            },
                            {
                                $or: [
                                    { name: { $regex: key[1], $options: 'i' } },
                                    { customer_name: { $regex: key[1], $options: 'i' } },
                                    { customer_designation: { $regex: key[1], $options: 'i' } },
                                    { mobile: { $regex: key[1], $options: 'i' } },
                                    { email: { $regex: key[1], $options: 'i' } },
                                    { country: { $regex: key[1], $options: 'i' } },
                                    { address: { $regex: key[1], $options: 'i' } },
                                    { work_description: { $regex: key[1], $options: 'i' } },
                                    { turnover: { $regex: key[1], $options: 'i' } },
                                    { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                    { alternate_email: { $regex: key[1], $options: 'i' } },
                                    { lead_type: { $regex: key[1], $options: 'i' } },

                                    { lead_source: { $regex: key[1], $options: 'i' } },
                                    { last_remark: { $regex: key[1], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            }
                        ]
                        ,

                    }
                    ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

                }
                if (key.length == 3) {

                    leads = await Lead.find({
                        stage: stage, state: { $in: states }, city: { $in: cities },
                        $and: [
                            {
                                $or: [
                                    { name: { $regex: key[0], $options: 'i' } },
                                    { customer_name: { $regex: key[0], $options: 'i' } },
                                    { customer_designation: { $regex: key[0], $options: 'i' } },
                                    { gst: { $regex: key[0], $options: 'i' } },
                                    { mobile: { $regex: key[0], $options: 'i' } },
                                    { email: { $regex: key[0], $options: 'i' } },
                                    { country: { $regex: key[0], $options: 'i' } },
                                    { address: { $regex: key[0], $options: 'i' } },
                                    { work_description: { $regex: key[0], $options: 'i' } },
                                    { turnover: { $regex: key[0], $options: 'i' } },
                                    { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                    { alternate_email: { $regex: key[0], $options: 'i' } },
                                    { lead_type: { $regex: key[0], $options: 'i' } },
                                    { lead_source: { $regex: key[0], $options: 'i' } },
                                    { last_remark: { $regex: key[0], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            },
                            {
                                $or: [
                                    { name: { $regex: key[1], $options: 'i' } },
                                    { customer_name: { $regex: key[1], $options: 'i' } },
                                    { customer_designation: { $regex: key[1], $options: 'i' } },
                                    { mobile: { $regex: key[1], $options: 'i' } },
                                    { email: { $regex: key[1], $options: 'i' } },
                                    { country: { $regex: key[1], $options: 'i' } },
                                    { address: { $regex: key[1], $options: 'i' } },
                                    { work_description: { $regex: key[1], $options: 'i' } },
                                    { turnover: { $regex: key[1], $options: 'i' } },
                                    { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                    { alternate_email: { $regex: key[1], $options: 'i' } },
                                    { lead_type: { $regex: key[1], $options: 'i' } },

                                    { lead_source: { $regex: key[1], $options: 'i' } },
                                    { last_remark: { $regex: key[1], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            },
                            {
                                $or: [
                                    { name: { $regex: key[2], $options: 'i' } },
                                    { customer_name: { $regex: key[2], $options: 'i' } },
                                    { customer_designation: { $regex: key[2], $options: 'i' } },
                                    { mobile: { $regex: key[2], $options: 'i' } },
                                    { email: { $regex: key[2], $options: 'i' } },
                                    { country: { $regex: key[2], $options: 'i' } },
                                    { address: { $regex: key[2], $options: 'i' } },
                                    { work_description: { $regex: key[2], $options: 'i' } },
                                    { turnover: { $regex: key[2], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                    { alternate_email: { $regex: key[2], $options: 'i' } },
                                    { lead_type: { $regex: key[2], $options: 'i' } },

                                    { lead_source: { $regex: key[2], $options: 'i' } },
                                    { last_remark: { $regex: key[2], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            }
                        ]
                        ,

                    }
                    ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

                }
                if (key.length == 4) {

                    leads = await Lead.find({
                        stage: stage, state: { $in: states }, city: { $in: cities },
                        $and: [
                            {
                                $or: [
                                    { name: { $regex: key[0], $options: 'i' } },
                                    { customer_name: { $regex: key[0], $options: 'i' } },
                                    { customer_designation: { $regex: key[0], $options: 'i' } },
                                    { gst: { $regex: key[0], $options: 'i' } },
                                    { mobile: { $regex: key[0], $options: 'i' } },
                                    { email: { $regex: key[0], $options: 'i' } },
                                    { country: { $regex: key[0], $options: 'i' } },
                                    { address: { $regex: key[0], $options: 'i' } },
                                    { work_description: { $regex: key[0], $options: 'i' } },
                                    { turnover: { $regex: key[0], $options: 'i' } },
                                    { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                    { alternate_email: { $regex: key[0], $options: 'i' } },
                                    { lead_type: { $regex: key[0], $options: 'i' } },
                                    { lead_source: { $regex: key[0], $options: 'i' } },
                                    { last_remark: { $regex: key[0], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            },
                            {
                                $or: [
                                    { name: { $regex: key[1], $options: 'i' } },
                                    { customer_name: { $regex: key[1], $options: 'i' } },
                                    { customer_designation: { $regex: key[1], $options: 'i' } },
                                    { mobile: { $regex: key[1], $options: 'i' } },
                                    { email: { $regex: key[1], $options: 'i' } },
                                    { country: { $regex: key[1], $options: 'i' } },
                                    { address: { $regex: key[1], $options: 'i' } },
                                    { work_description: { $regex: key[1], $options: 'i' } },
                                    { turnover: { $regex: key[1], $options: 'i' } },
                                    { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                    { alternate_email: { $regex: key[1], $options: 'i' } },
                                    { lead_type: { $regex: key[1], $options: 'i' } },

                                    { lead_source: { $regex: key[1], $options: 'i' } },
                                    { last_remark: { $regex: key[1], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            },
                            {
                                $or: [
                                    { name: { $regex: key[2], $options: 'i' } },
                                    { customer_name: { $regex: key[2], $options: 'i' } },
                                    { customer_designation: { $regex: key[2], $options: 'i' } },
                                    { mobile: { $regex: key[2], $options: 'i' } },
                                    { email: { $regex: key[2], $options: 'i' } },
                                    { country: { $regex: key[2], $options: 'i' } },
                                    { address: { $regex: key[2], $options: 'i' } },
                                    { work_description: { $regex: key[2], $options: 'i' } },
                                    { turnover: { $regex: key[2], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                    { alternate_email: { $regex: key[2], $options: 'i' } },
                                    { lead_type: { $regex: key[2], $options: 'i' } },

                                    { lead_source: { $regex: key[2], $options: 'i' } },
                                    { last_remark: { $regex: key[2], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            },
                            {
                                $or: [
                                    { name: { $regex: key[3], $options: 'i' } },
                                    { customer_name: { $regex: key[3], $options: 'i' } },
                                    { customer_designation: { $regex: key[3], $options: 'i' } },
                                    { mobile: { $regex: key[3], $options: 'i' } },
                                    { email: { $regex: key[3], $options: 'i' } },
                                    { country: { $regex: key[3], $options: 'i' } },
                                    { address: { $regex: key[3], $options: 'i' } },
                                    { work_description: { $regex: key[3], $options: 'i' } },
                                    { turnover: { $regex: key[3], $options: 'i' } },
                                    { alternate_mobile3: { $regex: key[3], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[3], $options: 'i' } },
                                    { alternate_email: { $regex: key[3], $options: 'i' } },
                                    { lead_type: { $regex: key[3], $options: 'i' } },

                                    { lead_source: { $regex: key[3], $options: 'i' } },
                                    { last_remark: { $regex: key[3], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            }
                        ]
                        ,

                    }
                    ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

                }
            }
            else if (showonlycardleads) {
                if (key.length == 1 || key.length > 4) {

                    leads = await Lead.find({
                        has_card: showonlycardleads, state: { $in: states }, city: { $in: cities },
                        $or: [
                            { name: { $regex: key[0], $options: 'i' } },
                            { customer_name: { $regex: key[0], $options: 'i' } },
                            { customer_designation: { $regex: key[0], $options: 'i' } },
                            { mobile: { $regex: key[0], $options: 'i' } },
                            { email: { $regex: key[0], $options: 'i' } },
                            { country: { $regex: key[0], $options: 'i' } },
                            { address: { $regex: key[0], $options: 'i' } },
                            { work_description: { $regex: key[0], $options: 'i' } },
                            { turnover: { $regex: key[0], $options: 'i' } },
                            { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                            { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                            { alternate_email: { $regex: key[0], $options: 'i' } },
                            { lead_type: { $regex: key[0], $options: 'i' } },
                            { lead_source: { $regex: key[0], $options: 'i' } },
                            { last_remark: { $regex: key[0], $options: 'i' } },
                            { city: { $regex: key[0], $options: 'i' } },
                            { state: { $regex: key[0], $options: 'i' } },
                        ]

                    }
                    ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

                }
                if (key.length == 2) {

                    leads = await Lead.find({
                        has_card: showonlycardleads, state: { $in: states }, city: { $in: cities },
                        $and: [
                            {
                                $or: [
                                    { name: { $regex: key[0], $options: 'i' } },
                                    { customer_name: { $regex: key[0], $options: 'i' } },
                                    { customer_designation: { $regex: key[0], $options: 'i' } },
                                    { mobile: { $regex: key[0], $options: 'i' } },
                                    { email: { $regex: key[0], $options: 'i' } },
                                    { country: { $regex: key[0], $options: 'i' } },
                                    { address: { $regex: key[0], $options: 'i' } },
                                    { work_description: { $regex: key[0], $options: 'i' } },
                                    { turnover: { $regex: key[0], $options: 'i' } },
                                    { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                    { alternate_email: { $regex: key[0], $options: 'i' } },
                                    { lead_type: { $regex: key[0], $options: 'i' } },
                                    { lead_source: { $regex: key[0], $options: 'i' } },
                                    { last_remark: { $regex: key[0], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            },
                            {
                                $or: [
                                    { name: { $regex: key[1], $options: 'i' } },
                                    { customer_name: { $regex: key[1], $options: 'i' } },
                                    { customer_designation: { $regex: key[1], $options: 'i' } },
                                    { mobile: { $regex: key[1], $options: 'i' } },
                                    { email: { $regex: key[1], $options: 'i' } },
                                    { country: { $regex: key[1], $options: 'i' } },
                                    { address: { $regex: key[1], $options: 'i' } },
                                    { work_description: { $regex: key[1], $options: 'i' } },
                                    { turnover: { $regex: key[1], $options: 'i' } },
                                    { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                    { alternate_email: { $regex: key[1], $options: 'i' } },
                                    { lead_type: { $regex: key[1], $options: 'i' } },
                                    { lead_source: { $regex: key[1], $options: 'i' } },
                                    { last_remark: { $regex: key[1], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            }
                        ]
                        ,

                    }
                    ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

                }
                if (key.length == 3) {

                    leads = await Lead.find({
                        has_card: showonlycardleads, state: { $in: states }, city: { $in: cities },
                        $and: [
                            {
                                $or: [
                                    { name: { $regex: key[0], $options: 'i' } },
                                    { customer_name: { $regex: key[0], $options: 'i' } },
                                    { customer_designation: { $regex: key[0], $options: 'i' } },
                                    { mobile: { $regex: key[0], $options: 'i' } },
                                    { email: { $regex: key[0], $options: 'i' } },
                                    { country: { $regex: key[0], $options: 'i' } },
                                    { address: { $regex: key[0], $options: 'i' } },
                                    { work_description: { $regex: key[0], $options: 'i' } },
                                    { turnover: { $regex: key[0], $options: 'i' } },
                                    { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                    { alternate_email: { $regex: key[0], $options: 'i' } },
                                    { lead_type: { $regex: key[0], $options: 'i' } },
                                    { lead_source: { $regex: key[0], $options: 'i' } },
                                    { last_remark: { $regex: key[0], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            },
                            {
                                $or: [
                                    { name: { $regex: key[1], $options: 'i' } },
                                    { customer_name: { $regex: key[1], $options: 'i' } },
                                    { customer_designation: { $regex: key[1], $options: 'i' } },
                                    { mobile: { $regex: key[1], $options: 'i' } },
                                    { email: { $regex: key[1], $options: 'i' } },
                                    { country: { $regex: key[1], $options: 'i' } },
                                    { address: { $regex: key[1], $options: 'i' } },
                                    { work_description: { $regex: key[1], $options: 'i' } },
                                    { turnover: { $regex: key[1], $options: 'i' } },
                                    { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                    { alternate_email: { $regex: key[1], $options: 'i' } },
                                    { lead_type: { $regex: key[1], $options: 'i' } },
                                    { lead_source: { $regex: key[1], $options: 'i' } },
                                    { last_remark: { $regex: key[1], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            },
                            {
                                $or: [
                                    { name: { $regex: key[2], $options: 'i' } },
                                    { customer_name: { $regex: key[2], $options: 'i' } },
                                    { customer_designation: { $regex: key[2], $options: 'i' } },
                                    { mobile: { $regex: key[2], $options: 'i' } },
                                    { email: { $regex: key[2], $options: 'i' } },
                                    { country: { $regex: key[2], $options: 'i' } },
                                    { address: { $regex: key[2], $options: 'i' } },
                                    { work_description: { $regex: key[2], $options: 'i' } },
                                    { turnover: { $regex: key[2], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                    { alternate_email: { $regex: key[2], $options: 'i' } },
                                    { lead_type: { $regex: key[2], $options: 'i' } },
                                    { lead_source: { $regex: key[2], $options: 'i' } },
                                    { last_remark: { $regex: key[2], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            }
                        ]
                        ,

                    }
                    ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

                }
                if (key.length == 4) {

                    leads = await Lead.find({
                        has_card: showonlycardleads, state: { $in: states }, city: { $in: cities },
                        $and: [
                            {
                                $or: [
                                    { name: { $regex: key[0], $options: 'i' } },
                                    { customer_name: { $regex: key[0], $options: 'i' } },
                                    { customer_designation: { $regex: key[0], $options: 'i' } },
                                    { mobile: { $regex: key[0], $options: 'i' } },
                                    { email: { $regex: key[0], $options: 'i' } },
                                    { country: { $regex: key[0], $options: 'i' } },
                                    { address: { $regex: key[0], $options: 'i' } },
                                    { work_description: { $regex: key[0], $options: 'i' } },
                                    { turnover: { $regex: key[0], $options: 'i' } },
                                    { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                    { alternate_email: { $regex: key[0], $options: 'i' } },
                                    { lead_type: { $regex: key[0], $options: 'i' } },
                                    { lead_source: { $regex: key[0], $options: 'i' } },
                                    { last_remark: { $regex: key[0], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            },
                            {
                                $or: [
                                    { name: { $regex: key[1], $options: 'i' } },
                                    { customer_name: { $regex: key[1], $options: 'i' } },
                                    { customer_designation: { $regex: key[1], $options: 'i' } },
                                    { mobile: { $regex: key[1], $options: 'i' } },
                                    { email: { $regex: key[1], $options: 'i' } },
                                    { country: { $regex: key[1], $options: 'i' } },
                                    { address: { $regex: key[1], $options: 'i' } },
                                    { work_description: { $regex: key[1], $options: 'i' } },
                                    { turnover: { $regex: key[1], $options: 'i' } },
                                    { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                    { alternate_email: { $regex: key[1], $options: 'i' } },
                                    { lead_type: { $regex: key[1], $options: 'i' } },
                                    { lead_source: { $regex: key[1], $options: 'i' } },
                                    { last_remark: { $regex: key[1], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            },
                            {
                                $or: [
                                    { name: { $regex: key[2], $options: 'i' } },
                                    { customer_name: { $regex: key[2], $options: 'i' } },
                                    { customer_designation: { $regex: key[2], $options: 'i' } },
                                    { mobile: { $regex: key[2], $options: 'i' } },
                                    { email: { $regex: key[2], $options: 'i' } },
                                    { country: { $regex: key[2], $options: 'i' } },
                                    { address: { $regex: key[2], $options: 'i' } },
                                    { work_description: { $regex: key[2], $options: 'i' } },
                                    { turnover: { $regex: key[2], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                    { alternate_email: { $regex: key[2], $options: 'i' } },
                                    { lead_type: { $regex: key[2], $options: 'i' } },
                                    { lead_source: { $regex: key[2], $options: 'i' } },
                                    { last_remark: { $regex: key[2], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            },
                            {
                                $or: [
                                    { name: { $regex: key[3], $options: 'i' } },
                                    { customer_name: { $regex: key[3], $options: 'i' } },
                                    { customer_designation: { $regex: key[3], $options: 'i' } },
                                    { mobile: { $regex: key[3], $options: 'i' } },
                                    { email: { $regex: key[3], $options: 'i' } },
                                    { country: { $regex: key[3], $options: 'i' } },
                                    { address: { $regex: key[3], $options: 'i' } },
                                    { work_description: { $regex: key[3], $options: 'i' } },
                                    { turnover: { $regex: key[3], $options: 'i' } },
                                    { alternate_mobile3: { $regex: key[3], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[3], $options: 'i' } },
                                    { alternate_email: { $regex: key[3], $options: 'i' } },
                                    { lead_type: { $regex: key[3], $options: 'i' } },
                                    { lead_source: { $regex: key[3], $options: 'i' } },
                                    { last_remark: { $regex: key[3], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            }
                        ]
                        ,

                    }
                    ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

                }
            }
            else {
                if (key.length == 1 || key.length > 4) {

                    leads = await Lead.find({
                        state: { $in: states }, city: { $in: cities },
                        $or: [
                            { name: { $regex: key[0], $options: 'i' } },
                            { customer_name: { $regex: key[0], $options: 'i' } },
                            { customer_designation: { $regex: key[0], $options: 'i' } },
                            { mobile: { $regex: key[0], $options: 'i' } },
                            { email: { $regex: key[0], $options: 'i' } },
                            { country: { $regex: key[0], $options: 'i' } },
                            { address: { $regex: key[0], $options: 'i' } },
                            { work_description: { $regex: key[0], $options: 'i' } },
                            { turnover: { $regex: key[0], $options: 'i' } },
                            { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                            { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                            { alternate_email: { $regex: key[0], $options: 'i' } },
                            { lead_type: { $regex: key[0], $options: 'i' } },
                            { lead_source: { $regex: key[0], $options: 'i' } },
                            { last_remark: { $regex: key[0], $options: 'i' } },
                            { city: { $regex: key[0], $options: 'i' } },
                            { state: { $regex: key[0], $options: 'i' } },
                        ]

                    }
                    ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

                }
                if (key.length == 2) {

                    leads = await Lead.find({
                        state: { $in: states }, city: { $in: cities },
                        $and: [
                            {
                                $or: [
                                    { name: { $regex: key[0], $options: 'i' } },
                                    { customer_name: { $regex: key[0], $options: 'i' } },
                                    { customer_designation: { $regex: key[0], $options: 'i' } },
                                    { mobile: { $regex: key[0], $options: 'i' } },
                                    { email: { $regex: key[0], $options: 'i' } },
                                    { country: { $regex: key[0], $options: 'i' } },
                                    { address: { $regex: key[0], $options: 'i' } },
                                    { work_description: { $regex: key[0], $options: 'i' } },
                                    { turnover: { $regex: key[0], $options: 'i' } },
                                    { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                    { alternate_email: { $regex: key[0], $options: 'i' } },
                                    { lead_type: { $regex: key[0], $options: 'i' } },
                                    { lead_source: { $regex: key[0], $options: 'i' } },
                                    { last_remark: { $regex: key[0], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            },
                            {
                                $or: [
                                    { name: { $regex: key[1], $options: 'i' } },
                                    { customer_name: { $regex: key[1], $options: 'i' } },
                                    { customer_designation: { $regex: key[1], $options: 'i' } },
                                    { mobile: { $regex: key[1], $options: 'i' } },
                                    { email: { $regex: key[1], $options: 'i' } },
                                    { country: { $regex: key[1], $options: 'i' } },
                                    { address: { $regex: key[1], $options: 'i' } },
                                    { work_description: { $regex: key[1], $options: 'i' } },
                                    { turnover: { $regex: key[1], $options: 'i' } },
                                    { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                    { alternate_email: { $regex: key[1], $options: 'i' } },
                                    { lead_type: { $regex: key[1], $options: 'i' } },
                                    { lead_source: { $regex: key[1], $options: 'i' } },
                                    { last_remark: { $regex: key[1], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            }
                        ]
                        ,

                    }
                    ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

                }
                if (key.length == 3) {

                    leads = await Lead.find({
                        state: { $in: states }, city: { $in: cities },
                        $and: [
                            {
                                $or: [
                                    { name: { $regex: key[0], $options: 'i' } },
                                    { customer_name: { $regex: key[0], $options: 'i' } },
                                    { customer_designation: { $regex: key[0], $options: 'i' } },
                                    { mobile: { $regex: key[0], $options: 'i' } },
                                    { email: { $regex: key[0], $options: 'i' } },
                                    { country: { $regex: key[0], $options: 'i' } },
                                    { address: { $regex: key[0], $options: 'i' } },
                                    { work_description: { $regex: key[0], $options: 'i' } },
                                    { turnover: { $regex: key[0], $options: 'i' } },
                                    { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                    { alternate_email: { $regex: key[0], $options: 'i' } },
                                    { lead_type: { $regex: key[0], $options: 'i' } },
                                    { lead_source: { $regex: key[0], $options: 'i' } },
                                    { last_remark: { $regex: key[0], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            },
                            {
                                $or: [
                                    { name: { $regex: key[1], $options: 'i' } },
                                    { customer_name: { $regex: key[1], $options: 'i' } },
                                    { customer_designation: { $regex: key[1], $options: 'i' } },
                                    { mobile: { $regex: key[1], $options: 'i' } },
                                    { email: { $regex: key[1], $options: 'i' } },
                                    { country: { $regex: key[1], $options: 'i' } },
                                    { address: { $regex: key[1], $options: 'i' } },
                                    { work_description: { $regex: key[1], $options: 'i' } },
                                    { turnover: { $regex: key[1], $options: 'i' } },
                                    { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                    { alternate_email: { $regex: key[1], $options: 'i' } },
                                    { lead_type: { $regex: key[1], $options: 'i' } },
                                    { lead_source: { $regex: key[1], $options: 'i' } },
                                    { last_remark: { $regex: key[1], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            },
                            {
                                $or: [
                                    { name: { $regex: key[2], $options: 'i' } },
                                    { customer_name: { $regex: key[2], $options: 'i' } },
                                    { customer_designation: { $regex: key[2], $options: 'i' } },
                                    { mobile: { $regex: key[2], $options: 'i' } },
                                    { email: { $regex: key[2], $options: 'i' } },
                                    { country: { $regex: key[2], $options: 'i' } },
                                    { address: { $regex: key[2], $options: 'i' } },
                                    { work_description: { $regex: key[2], $options: 'i' } },
                                    { turnover: { $regex: key[2], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                    { alternate_email: { $regex: key[2], $options: 'i' } },
                                    { lead_type: { $regex: key[2], $options: 'i' } },
                                    { lead_source: { $regex: key[2], $options: 'i' } },
                                    { last_remark: { $regex: key[2], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            }
                        ]
                        ,

                    }
                    ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

                }
                if (key.length == 4) {

                    leads = await Lead.find({
                        state: { $in: states }, city: { $in: cities },
                        $and: [
                            {
                                $or: [
                                    { name: { $regex: key[0], $options: 'i' } },
                                    { customer_name: { $regex: key[0], $options: 'i' } },
                                    { customer_designation: { $regex: key[0], $options: 'i' } },
                                    { mobile: { $regex: key[0], $options: 'i' } },
                                    { email: { $regex: key[0], $options: 'i' } },
                                    { country: { $regex: key[0], $options: 'i' } },
                                    { address: { $regex: key[0], $options: 'i' } },
                                    { work_description: { $regex: key[0], $options: 'i' } },
                                    { turnover: { $regex: key[0], $options: 'i' } },
                                    { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                    { alternate_email: { $regex: key[0], $options: 'i' } },
                                    { lead_type: { $regex: key[0], $options: 'i' } },
                                    { lead_source: { $regex: key[0], $options: 'i' } },
                                    { last_remark: { $regex: key[0], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            },
                            {
                                $or: [
                                    { name: { $regex: key[1], $options: 'i' } },
                                    { customer_name: { $regex: key[1], $options: 'i' } },
                                    { customer_designation: { $regex: key[1], $options: 'i' } },
                                    { mobile: { $regex: key[1], $options: 'i' } },
                                    { email: { $regex: key[1], $options: 'i' } },
                                    { country: { $regex: key[1], $options: 'i' } },
                                    { address: { $regex: key[1], $options: 'i' } },
                                    { work_description: { $regex: key[1], $options: 'i' } },
                                    { turnover: { $regex: key[1], $options: 'i' } },
                                    { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                    { alternate_email: { $regex: key[1], $options: 'i' } },
                                    { lead_type: { $regex: key[1], $options: 'i' } },
                                    { lead_source: { $regex: key[1], $options: 'i' } },
                                    { last_remark: { $regex: key[1], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            },
                            {
                                $or: [
                                    { name: { $regex: key[2], $options: 'i' } },
                                    { customer_name: { $regex: key[2], $options: 'i' } },
                                    { customer_designation: { $regex: key[2], $options: 'i' } },
                                    { mobile: { $regex: key[2], $options: 'i' } },
                                    { email: { $regex: key[2], $options: 'i' } },
                                    { country: { $regex: key[2], $options: 'i' } },
                                    { address: { $regex: key[2], $options: 'i' } },
                                    { work_description: { $regex: key[2], $options: 'i' } },
                                    { turnover: { $regex: key[2], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                    { alternate_email: { $regex: key[2], $options: 'i' } },
                                    { lead_type: { $regex: key[2], $options: 'i' } },
                                    { lead_source: { $regex: key[2], $options: 'i' } },
                                    { last_remark: { $regex: key[2], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            },
                            {
                                $or: [
                                    { name: { $regex: key[3], $options: 'i' } },
                                    { customer_name: { $regex: key[3], $options: 'i' } },
                                    { customer_designation: { $regex: key[3], $options: 'i' } },
                                    { mobile: { $regex: key[3], $options: 'i' } },
                                    { email: { $regex: key[3], $options: 'i' } },
                                    { country: { $regex: key[3], $options: 'i' } },
                                    { address: { $regex: key[3], $options: 'i' } },
                                    { work_description: { $regex: key[3], $options: 'i' } },
                                    { turnover: { $regex: key[3], $options: 'i' } },
                                    { alternate_mobile3: { $regex: key[3], $options: 'i' } },
                                    { alternate_mobile2: { $regex: key[3], $options: 'i' } },
                                    { alternate_email: { $regex: key[3], $options: 'i' } },
                                    { lead_type: { $regex: key[3], $options: 'i' } },
                                    { lead_source: { $regex: key[3], $options: 'i' } },
                                    { last_remark: { $regex: key[3], $options: 'i' } },
                                    { city: { $regex: key[0], $options: 'i' } },
                                    { state: { $regex: key[0], $options: 'i' } },
                                ]
                            }
                        ]
                        ,

                    }
                    ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

                }

            }

            let count = leads.length
            leads = leads.slice((page - 1) * limit, limit * page)

            result = leads.map((lead) => {
                return {
                    _id: lead._id,
                    name: lead.name,
                    customer_name: lead.customer_name,
                    customer_designation: lead.customer_designation,
                    mobile: lead.lead_type == "company" ? "" : lead.mobile,
                    gst: lead.gst,
                    has_card: lead.has_card,
                    email: lead.email,
                    city: lead.city,
                    state: lead.state,
                    uploaded_bills: lead.uploaded_bills || 0,
                    last_remark: lead.last_remark || "",
                    country: lead.country,
                    address: lead.address,
                    work_description: lead.work_description,
                    turnover: lead.turnover,
                    alternate_mobile1: lead.lead_type == "company" ? "" : lead.alternate_mobile1,
                    alternate_mobile2: lead.lead_type == "company" ? "" : lead.alternate_mobile2,
                    alternate_email: lead.alternate_email,
                    lead_type: lead.lead_type,
                    stage: lead.stage,
                    lead_source: lead.lead_source,
                    visiting_card: lead.visiting_card?.public_url || "",
                    referred_party_name: lead.referred_party && lead.referred_party.name,
                    referred_party_mobile: lead.referred_party && lead.referred_party.mobile,
                    referred_date: lead.referred_party && moment(lead.referred_date).format("DD/MM/YYYY"),
                    created_at: moment(lead.created_at).format("DD/MM/YYYY"),
                    updated_at: moment(lead.updated_at).format("DD/MM/YYYY"),
                    created_by: { id: lead.created_by._id, value: lead.created_by.username, label: lead.created_by.username },
                    updated_by: { id: lead.updated_by._id, value: lead.updated_by.username, label: lead.updated_by.username },
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


    public async CreateLead(req: Request, res: Response, next: NextFunction) {
        let body = JSON.parse(req.body.body)
        let { mobile, remark, alternate_mobile1, alternate_mobile2 } = body as CreateOrEditLeadDto

        // validations
        if (!mobile)
            return res.status(400).json({ message: "provide primary mobile number" });

        if (await ReferredParty.findOne({ mobile: mobile }))
            return res.status(400).json({ message: "our refer party exists with this mobile" });
        let uniqueNumbers = []
        if (mobile)
            uniqueNumbers.push(mobile)
        if (alternate_mobile1)
            uniqueNumbers.push(alternate_mobile1)
        if (alternate_mobile2)
            uniqueNumbers.push(alternate_mobile2)

        uniqueNumbers = uniqueNumbers.filter((item, i, ar) => ar.indexOf(item) === i);

        if (uniqueNumbers[0] && await Lead.findOne({ $or: [{ mobile: uniqueNumbers[0] }, { alternate_mobile1: uniqueNumbers[0] }, { alternate_mobile2: uniqueNumbers[0] }] }))
            return res.status(400).json({ message: `${mobile} already exists ` })


        if (uniqueNumbers[1] && await Lead.findOne({ $or: [{ mobile: uniqueNumbers[1] }, { alternate_mobile1: uniqueNumbers[1] }, { alternate_mobile2: uniqueNumbers[1] }] }))
            return res.status(400).json({ message: `${uniqueNumbers[1]} already exists ` })

        if (uniqueNumbers[2] && await Lead.findOne({ $or: [{ mobile: uniqueNumbers[2] }, { alternate_mobile1: uniqueNumbers[2] }, { alternate_mobile2: uniqueNumbers[2] }] }))
            return res.status(400).json({ message: `${uniqueNumbers[2]} already exists ` })

        let visiting_card: Asset = undefined
        if (req.file) {
            const allowedFiles = ["image/png", "image/jpeg", "image/gif", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/pdf"];
            const storageLocation = `crm/media`;
            if (!allowedFiles.includes(req.file.mimetype))
                return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
            if (req.file.size > 20 * 1024 * 1024)
                return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
            const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
            if (doc)
                visiting_card = doc
            else {
                return res.status(500).json({ message: "file uploading error" })
            }
        }
        let state = "unknown";
        if (body.state && body.state != "") state = body.state
        let city = "unknown";
        if (body.city && body.city != "") city = body.city
        let lead = new Lead({
            ...body,
            stage: 'open',
            state: state,
            last_remark: remark || "",
            city: city,
            visiting_card: visiting_card,
            mobile: uniqueNumbers[0] || null,
            alternate_mobile1: uniqueNumbers[1] || null,
            alternate_mobile2: uniqueNumbers[2] || null,
            created_by: req.user,
            updated_by: req.user,
            created_at: new Date(Date.now()),
            updated_at: new Date(Date.now()),
        })
        if (remark) {
            let new_remark = new Remark({
                remark,
                lead: lead,
                created_at: new Date(),
                created_by: req.user,
                updated_at: new Date(),
                updated_by: req.user
            })
            await new_remark.save()
        }

        await lead.save()

        return res.status(200).json("lead created")
    }


    public async UpdateLead(req: Request, res: Response, next: NextFunction) {
        let body = JSON.parse(req.body.body)
        const { mobile, remark, alternate_mobile1, alternate_mobile2 } = body as CreateOrEditLeadDto

        const id = req.params.id;
        if (!isMongoId(id)) return res.status(400).json({ message: "lead id not valid" })
        let lead = await Lead.findById(id);
        if (!lead) {
            return res.status(404).json({ message: "lead not found" })
        }
        // validations
        if (!mobile)
            return res.status(400).json({ message: "provide primary mobile number" });

        let uniqueNumbers = []
        if (mobile) {
            if (mobile === lead.mobile) {
                uniqueNumbers[0] = lead.mobile
            }
            if (mobile !== lead.mobile) {
                uniqueNumbers[0] = mobile
            }
        }
        if (alternate_mobile1) {
            if (alternate_mobile1 === lead.alternate_mobile1) {
                uniqueNumbers[1] = lead.alternate_mobile1
            }
            if (alternate_mobile1 !== lead.alternate_mobile1) {
                uniqueNumbers[1] = alternate_mobile1
            }
        }
        if (alternate_mobile2) {
            if (alternate_mobile2 === lead.alternate_mobile2) {
                uniqueNumbers[2] = lead.alternate_mobile2
            }
            if (alternate_mobile2 !== lead.alternate_mobile2) {
                uniqueNumbers[2] = alternate_mobile2
            }
        }

        uniqueNumbers = uniqueNumbers.filter((item, i, ar) => ar.indexOf(item) === i);


        if (uniqueNumbers[0] && uniqueNumbers[0] !== lead.mobile && await Lead.findOne({ $or: [{ mobile: uniqueNumbers[0] }, { alternate_mobile1: uniqueNumbers[0] }, { alternate_mobile2: uniqueNumbers[0] }] }))
            return res.status(400).json({ message: `${mobile} already exists ` })


        if (uniqueNumbers[1] && uniqueNumbers[1] !== lead.alternate_mobile1 && await Lead.findOne({ $or: [{ mobile: uniqueNumbers[1] }, { alternate_mobile1: uniqueNumbers[1] }, { alternate_mobile2: uniqueNumbers[1] }] }))
            return res.status(400).json({ message: `${uniqueNumbers[1]} already exists ` })

        if (uniqueNumbers[2] && uniqueNumbers[2] !== lead.alternate_mobile2 && await Lead.findOne({ $or: [{ mobile: uniqueNumbers[2] }, { alternate_mobile1: uniqueNumbers[2] }, { alternate_mobile2: uniqueNumbers[2] }] }))
            return res.status(400).json({ message: `${uniqueNumbers[2]} already exists ` })


        let visiting_card = lead?.visiting_card;
        if (req.file) {
            const allowedFiles = ["image/png", "image/jpeg", "image/gif", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/pdf"];
            const storageLocation = `crm/media`;
            if (!allowedFiles.includes(req.file.mimetype))
                return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
            if (req.file.size > 20 * 1024 * 1024)
                return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
            const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
            if (doc) {
                if (lead.visiting_card?._id)
                    await destroyCloudFile(lead.visiting_card._id)
                visiting_card = doc
            }
            else {
                return res.status(500).json({ message: "file uploading error" })
            }
        }
        if (remark)
            await new Remark({
                remark: 'lead updated',
                lead: lead,
                created_at: new Date(),
                created_by: req.user,
                updated_at: new Date(),
                updated_by: req.user
            }).save()
        let state = "unknown";
        if (body.state && body.state != "") state = body.state
        let city = "unknown";
        if (body.city && body.city != "") city = body.city
        await Lead.findByIdAndUpdate(lead._id, {
            ...body,
            last_remark: remark ? remark : lead.last_remark,
            city: city,
            state: state,
            mobile: uniqueNumbers[0] || null,
            alternate_mobile1: uniqueNumbers[1] || null,
            alternate_mobile2: uniqueNumbers[2] || null,
            visiting_card: visiting_card,
            updated_by: req.user,
            updated_at: new Date(Date.now())
        })

        return res.status(200).json({ message: "lead updated" })
    }


    public async DeleteLead(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "lead id not valid" })
        let lead = await Lead.findById(id);
        if (!lead) {
            return res.status(404).json({ message: "lead not found" })
        }
        let remarks = await Remark.find({ lead: lead._id })
        remarks.map(async (remark) => {
            await remark.remove()
        })
        await lead.remove()
        if (lead.visiting_card && lead.visiting_card._id)
            await destroyCloudFile(lead.visiting_card?._id)

        return res.status(200).json({ message: "lead and related remarks are deleted" })
    }

    public async BulkLeadUpdateFromExcel(req: Request, res: Response, next: NextFunction) {
        let result: GetLeadFromExcelDto[] = []
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
            let workbook_response: GetLeadFromExcelDto[] = xlsx.utils.sheet_to_json(
                workbook.Sheets[workbook_sheet[0]]
            );
            if (workbook_response.length > 3000) {
                return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
            }
            let checkednumbers: string[] = []
            for (let i = 0; i < workbook_response.length; i++) {
                let lead = workbook_response[i]
                let new_: IUser[] = []
                let mobile: string | null = lead.mobile
                let stage: string | null = lead.stage
                let leadtype: string | null = lead.lead_type
                let source: string | null = lead.lead_source
                let city: string | null = lead.city
                let state: string | null = lead.state
                let alternate_mobile1: string | null = lead.alternate_mobile1
                let alternate_mobile2: string | null = lead.alternate_mobile2
                let uniqueNumbers: string[] = []
                let validated = true

                //important
                if (!mobile) {
                    validated = false
                    statusText = "required mobile"
                }

                if (mobile && Number.isNaN(Number(mobile))) {
                    validated = false
                    statusText = "invalid mobile"
                }
                if (alternate_mobile1 && Number.isNaN(Number(alternate_mobile1))) {
                    validated = false
                    statusText = "invalid alternate mobile 1"
                }
                if (alternate_mobile2 && Number.isNaN(Number(alternate_mobile2))) {
                    validated = false
                    statusText = "invalid alternate mobile 2"
                }
                if (alternate_mobile1 && String(alternate_mobile1).length !== 10)
                    alternate_mobile1 = null
                if (alternate_mobile2 && String(alternate_mobile2).length !== 10)
                    alternate_mobile2 = null

                if (mobile && String(mobile).length !== 10) {
                    validated = false
                    statusText = "invalid mobile"
                }



                //duplicate mobile checker
                if (lead._id && isMongoId(String(lead._id))) {
                    let targetLead = await Lead.findById(lead._id)
                    if (targetLead) {
                        if (mobile && mobile === targetLead?.mobile) {
                            uniqueNumbers.push(targetLead?.mobile)
                        }
                        if (alternate_mobile1 && alternate_mobile1 === targetLead?.alternate_mobile1) {
                            uniqueNumbers.push(targetLead?.alternate_mobile1)
                        }
                        if (alternate_mobile2 && alternate_mobile2 === targetLead?.alternate_mobile2) {
                            uniqueNumbers.push(targetLead?.alternate_mobile2)
                        }

                        if (mobile && mobile !== targetLead?.mobile) {
                            let ld = await Lead.findOne({ $or: [{ mobile: mobile }, { alternate_mobile1: mobile }, { alternate_mobile2: mobile }] })
                            if (!ld && !checkednumbers.includes(mobile)) {
                                uniqueNumbers.push(mobile)
                                checkednumbers.push(mobile)
                            }
                        }

                        if (alternate_mobile1 && alternate_mobile1 !== targetLead?.alternate_mobile1) {
                            let ld = await Lead.findOne({ $or: [{ mobile: alternate_mobile1 }, { alternate_mobile1: alternate_mobile1 }, { alternate_mobile2: alternate_mobile1 }] })
                            if (!ld && !checkednumbers.includes(alternate_mobile1)) {
                                uniqueNumbers.push(alternate_mobile1)
                                checkednumbers.push(alternate_mobile1)
                            }
                        }

                        if (alternate_mobile2 && alternate_mobile2 !== targetLead?.alternate_mobile2) {
                            let ld = await Lead.findOne({ $or: [{ mobile: alternate_mobile2 }, { alternate_mobile1: alternate_mobile2 }, { alternate_mobile2: alternate_mobile2 }] })
                            if (!ld && !checkednumbers.includes(alternate_mobile2)) {
                                uniqueNumbers.push(alternate_mobile2)
                                checkednumbers.push(alternate_mobile2)
                            }
                        }
                    }
                }

                if (!lead._id || !isMongoId(String(lead._id))) {
                    if (mobile) {
                        let ld = await Lead.findOne({ $or: [{ mobile: mobile }, { alternate_mobile1: mobile }, { alternate_mobile2: mobile }] })
                        if (ld) {
                            validated = false
                            statusText = "duplicate"
                        }
                        if (!ld) {
                            uniqueNumbers.push(mobile)
                        }
                    }

                    if (alternate_mobile1) {
                        let ld = await Lead.findOne({ $or: [{ mobile: alternate_mobile1 }, { alternate_mobile1: alternate_mobile1 }, { alternate_mobile2: alternate_mobile1 }] })
                        if (ld) {
                            validated = false
                            statusText = "duplicate"
                        }
                        if (!ld) {
                            uniqueNumbers.push(alternate_mobile1)
                        }
                    }
                    if (alternate_mobile2) {
                        let ld = await Lead.findOne({ $or: [{ mobile: alternate_mobile2 }, { alternate_mobile1: alternate_mobile2 }, { alternate_mobile2: alternate_mobile2 }] })
                        if (ld) {
                            validated = false
                            statusText = "duplicate"
                        }
                        if (!ld) {
                            uniqueNumbers.push(alternate_mobile2)
                        }
                    }

                }

                if (validated && uniqueNumbers.length > 0) {
                    //update and create new nead
                    if (lead._id && isMongoId(String(lead._id))) {
                        await Lead.findByIdAndUpdate(lead._id, {
                            ...lead,
                            stage: stage ? stage : "unknown",
                            lead_type: leadtype ? leadtype : "unknown",
                            lead_source: source ? source : "unknown",
                            city: city ? city : "unknown",
                            state: state ? state : "unknown",
                            mobile: uniqueNumbers[0],
                            alternate_mobile1: uniqueNumbers[1] || null,
                            alternate_mobile2: uniqueNumbers[2] || null,
                            updated_by: req.user,
                            updated_at: new Date(Date.now())
                        })
                        statusText = "updated"
                    }
                    if (!lead._id || !isMongoId(String(lead._id))) {
                        let newlead = new Lead({
                            ...lead,
                            _id: new Types.ObjectId(),
                            stage: stage ? stage : "unknown",
                            state: state ? state : "unknown",
                            lead_type: leadtype ? leadtype : "unknown",
                            lead_source: source ? source : "unknown",
                            city: city ? city : "unknown",
                            mobile: uniqueNumbers[0] || null,
                            alternate_mobile1: uniqueNumbers[1] || null,
                            alternate_mobile2: uniqueNumbers[2] || null,
                            created_by: req.user,
                            updated_by: req.user,
                            updated_at: new Date(Date.now()),
                            created_at: new Date(Date.now())
                        })

                        await newlead.save()
                        statusText = "created"
                    }
                }

                result.push({
                    ...lead,
                    status: statusText
                })
            }
        }
        return res.status(200).json(result);
    }
    public async BulkDeleteUselessLeads(req: Request, res: Response, next: NextFunction) {
        const { leads_ids } = req.body as { leads_ids: string[] }
        for (let i = 0; i <= leads_ids.length; i++) {
            let lead = await Lead.findById(leads_ids[i])
            if (lead && lead.stage == 'useless') {
                let remarks = await Remark.find({ lead: lead._id })
                remarks.map(async (remark) => {
                    await remark.remove()
                })
                await lead.remove()
                if (lead.visiting_card && lead.visiting_card._id)
                    await destroyCloudFile(lead.visiting_card?._id)
            }
        }
        return res.status(200).json({ message: "lead and related remarks are deleted" })
    }

    public async GetPaymentsTopBarDetails(req: Request, res: Response, next: NextFunction) {
        let result: { category: string, count: number }[] = []
        let categories = await PaymentCategory.find().sort('category')
        let count = await Payment.find({ category: { $in: categories } }).countDocuments()
        result.push({ category: 'total', count: count })
        for (let i = 0; i < categories.length; i++) {
            let cat = categories[i]
            let count = await Payment.find({ category: categories[i]._id }).countDocuments()
            result.push({ category: cat.category, count: count })
        }
        return res.status(200).json(result)
    }
    public async GetPayments(req: Request, res: Response, next: NextFunction) {
        let stage = req.query.stage
        let limit = Number(req.query.limit)
        let page = Number(req.query.page)
        let id = req.query.id
        let payments: IPayment[] = []
        let count = 0
        let result: GetPaymentDto[] = []

        if (!Number.isNaN(limit) && !Number.isNaN(page)) {
            if (req.user?.is_admin && !id) {
                {
                    payments = await Payment.find().populate('created_by').populate('updated_by').populate('category').populate('assigned_users').populate('lastcheckedpayment').sort('created_at').skip((page - 1) * limit).limit(limit)
                    count = await Payment.find().countDocuments()
                }
            }
            else if (!id) {
                payments = await Payment.find({ assigned_users: req.user?._id }).populate('created_by').populate('updated_by').populate('category').populate('lastcheckedpayment').populate('assigned_users').sort('created_at').skip((page - 1) * limit).limit(limit)
                count = await Payment.find({ assigned_users: req.user?._id }).countDocuments()
            }

            else {
                payments = await Payment.find({ assigned_users: id }).populate('created_by').populate('updated_by').populate('category').populate('assigned_users').sort('created_at').skip((page - 1) * limit).limit(limit)
                count = await Payment.find({ assigned_users: id }).countDocuments()
            }
            if (stage == "completed") {
                payments = payments.filter((ch) => {
                    return !ch.active
                })
            }
            else if (stage == "pending") {
                payments = payments.filter((ch) => {
                    return ch.active
                })
            }

            result = payments.map((ch) => {
                return {
                    _id: ch._id,
                    active: ch.active,
                    payment_title: ch.payment_title,
                    payment_description: ch.payment_description,
                    link: ch.link,
                    last_document: ch.lastcheckedpayment && {
                        _id: ch.lastcheckedpayment._id,
                        document: ch.lastcheckedpayment && ch.lastcheckedpayment.document && ch.lastcheckedpayment.document.public_url || '',
                        remark: ch.lastcheckedpayment.remark,
                        payment: { id: ch._id, label: ch.payment_title, value: ch.payment_title },
                        date: ch.lastcheckedpayment.created_at.toString()
                    },
                    category: { id: ch.category._id, value: ch.category.category, label: ch.category.category },
                    frequency: ch.frequency,
                    assigned_users: ch.assigned_users.map((u) => { return { id: u._id, value: u.username, label: u.username } }),
                    created_at: ch.created_at.toString(),
                    due_date: ch.due_date.toString(),
                    updated_at: ch.updated_at.toString(),
                    next_date: ch.next_date ? moment(ch.next_date).format("YYYY-MM-DD") : "",
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
    public async GetMobilePayments(req: Request, res: Response, next: NextFunction) {
        let payments: IPayment[] = []
        let result: GetPaymentDto[] = []

        payments = await Payment.find({ active: true, assigned_users: req.user?._id }).populate('created_by').populate('lastcheckedpayment').populate('updated_by').populate('category').populate('assigned_users')

        result = payments.map((ch) => {
            return {
                _id: ch._id,
                active: ch.active,
                payment_title: ch.payment_title,
                payment_description: ch.payment_description,
                link: ch.link,
                last_document: ch.lastcheckedpayment && {
                    _id: ch.lastcheckedpayment._id,
                    document: ch.lastcheckedpayment && ch.lastcheckedpayment.document && ch.lastcheckedpayment.document.public_url || '',
                    remark: ch.lastcheckedpayment.remark,
                    payment: { id: ch._id, label: ch.payment_title, value: ch.payment_title },
                    date: ch.lastcheckedpayment.created_at.toString()
                },
                category: { id: ch.category._id, value: ch.category.category, label: ch.category.category },
                frequency: ch.frequency,
                assigned_users: ch.assigned_users.map((u) => { return { id: u._id, value: u.username, label: u.username } }),
                created_at: ch.created_at.toString(),
                due_date: ch.due_date.toString(),
                updated_at: ch.updated_at.toString(),
                next_date: ch.next_date ? moment(ch.next_date).format("YYYY-MM-DD") : "",
                created_by: { id: ch.created_by._id, value: ch.created_by.username, label: ch.created_by.username },
                updated_by: { id: ch.updated_by._id, value: ch.updated_by.username, label: ch.updated_by.username }
            }
        })
        return res.status(200).json(result)
    }

    public async CreatePayment(req: Request, res: Response, next: NextFunction) {
        const {
            category,
            payment_title,
            duedate,
            payment_description,
            link,
            assigned_users,
            frequency } = req.body as CreateOrEditPaymentDto

        if (!category || !payment_title || !frequency || !duedate)
            return res.status(400).json({ message: "please provide all required fields" })

        let payment = new Payment({
            category: category,
            payment_title: payment_title,
            payment_description: payment_description,
            assigned_users: assigned_users,
            link: link,
            frequency: frequency,
            created_at: new Date(),
            due_date: new Date(duedate),
            created_by: req.user,
            updated_at: new Date(),
            updated_by: req.user
        })
        await payment.save();
        return res.status(201).json({ message: `New Payment added` });
    }
    public async EditPayment(req: Request, res: Response, next: NextFunction) {

        const {
            category,
            payment_title,
            payment_description,
            link,
            frequency,
            duedate,
            assigned_users } = req.body as CreateOrEditPaymentDto
        if (!payment_title && !duedate)
            return res.status(400).json({ message: "please provide all required fields" })

        let id = req.params.id

        let payment = await Payment.findById(id)
        if (!payment)
            return res.status(404).json({ message: 'payment not exists' })



        await Payment.findByIdAndUpdate(payment._id, {
            payment_title: payment_title,
            payment_description: payment_description,
            category: category,
            link: link,
            frequency: frequency,
            due_date: new Date(duedate),
            assigned_users: assigned_users,
            updated_at: new Date(),
            updated_by: req.user,
        })
        return res.status(200).json({ message: `Payment updated` });
    }

    public async CompletePayment(req: Request, res: Response, next: NextFunction) {
        const { remark } = req.body as CreateOrEditPaymentDocumentDto
        let document = new PaymentDocument({ remark: remark })
        await document.save()
        return res.status(200).json({ message: "document uploaded successfully" })
    }

    public async UpdatePayment(req: Request, res: Response, next: NextFunction) {
        const { remark } = req.body as CreateOrEditPaymentDocumentDto
        if (!remark) return res.status(403).json({ message: "please fill required fields" })

        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
        let document = await PaymentDocument.findById(id)
        if (!document) {
            return res.status(404).json({ message: "document not found" })
        }
        document.remark = remark
        await document.save()
        return res.status(200).json({ message: "document updated successfully" })
    }

    public async ChangeNextPaymentDate(req: Request, res: Response, next: NextFunction) {
        const {
            next_date } = req.body as { next_date: string }
        if (!next_date)
            return res.status(400).json({ message: "please provide all required fields" })

        let id = req.params.id

        let payment = await Payment.findById(id)
        if (!payment)
            return res.status(404).json({ message: 'payment not exists' })

        await Payment.findByIdAndUpdate(payment._id, {
            next_date: new Date(next_date),
            updated_at: new Date(),
            updated_by: req.user
        })
        return res.status(200).json({ message: `Payment next date updated` });
    }
    public async ChangeDueDate(req: Request, res: Response, next: NextFunction) {
        const {
            due_date } = req.body as { due_date: string }
        if (!due_date)
            return res.status(400).json({ message: "please provide all required fields" })

        let id = req.params.id

        let payment = await Payment.findById(id)
        if (!payment)
            return res.status(404).json({ message: 'payment not exists' })

        await Payment.findByIdAndUpdate(payment._id, {
            due_date: new Date(due_date),
            updated_at: new Date(),
            updated_by: req.user
        })
        return res.status(200).json({ message: `Payment next date updated` });
    }
    public async DeletePayment(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(400).json({ message: " id not valid" })

        let payment = await Payment.findById(id)
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" })
        }
        let docs = await PaymentDocument.find({ payment: payment._id })
        for (let i = 0; i < docs.length; i++) {
            let doc = docs[i]
            if (doc.document && doc.document?._id)
                await destroyCloudFile(doc.document._id)
            await PaymentDocument.findByIdAndDelete(doc._id)
        }
        await payment.remove()
        return res.status(200).json({ message: `Payment deleted` });
    }
    public async CreatePaymentFromExcel(req: Request, res: Response, next: NextFunction) {
        let result: GetPaymentsFromExcelDto[] = []
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
            let workbook_response: GetPaymentsFromExcelDto[] = xlsx.utils.sheet_to_json(
                workbook.Sheets[workbook_sheet[0]]
            );
            if (workbook_response.length > 3000) {
                return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
            }
            let end_date = new Date();
            end_date.setFullYear(end_date.getFullYear() + 30)
            for (let i = 0; i < workbook_response.length; i++) {
                let payment = workbook_response[i]
                let payment_title: string | null = payment.payment_title
                let payment_description: string | null = payment.payment_description
                let category: string | null = payment.category
                let duedate: string | null = payment.duedate
                let link: string | null = payment.link
                let frequency: string | undefined = payment.frequency
                let assigned_users: string | null = payment.assigned_users
                let _id: string | undefined = payment._id

                let validated = true

                //important
                if (!payment_title) {
                    validated = false
                    statusText = "required payment title"
                }

                if (!duedate) {
                    validated = false
                    statusText = "required duedate"
                }

                console.log(duedate)
                if (duedate && !isDate(parseExcelDate(duedate))) {
                    validated = false
                    statusText = "invalid duedate"
                }

                if (!category) {
                    validated = false
                    statusText = "required category"
                }
                if (category) {
                    let cat = await PaymentCategory.findOne({ category: category.trim().toLowerCase() })
                    if (!cat) {
                        validated = false
                        statusText = "category not found"
                    }
                    else
                        category = cat._id
                }
                if (payment_title) {
                    if (_id && isMongoId(String(_id))) {
                        let ch = await Payment.findById(_id)
                        if (ch?.payment_title !== payment_title)
                            if (await Payment.findOne({ payment_title: payment_title.trim().toLowerCase() })) {
                                validated = false
                                statusText = "payment already exists"
                            }
                    }
                    else {
                        if (await Payment.findOne({ payment_title: payment_title.trim().toLowerCase() })) {
                            validated = false
                            statusText = "payment already exists"
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
                if (frequency && !['quarterly', 'monthly', 'yearly'].includes(frequency)) {
                    validated = false
                    statusText = `invalid frequency`
                }
                if (validated) {
                    if (_id && isMongoId(String(_id))) {
                        await Payment.findByIdAndUpdate(payment._id, {
                            payment_title: payment_title,
                            payment_description: payment_description,
                            category: category,
                            frequency,
                            link: link,
                            assigned_users: users,
                            updated_at: new Date(),
                            due_date: parseExcelDate(duedate),
                            updated_by: req.user
                        })
                        statusText = "updated"
                    }
                    else {
                        let paymt = new Payment({
                            payment_title,
                            payment_description,
                            assigned_users: users,
                            frequency,
                            link,
                            category,
                            created_by: req.user,
                            updated_by: req.user,
                            due_date: parseExcelDate(duedate),
                            updated_at: new Date(Date.now()),
                            created_at: new Date(Date.now())
                        })

                        await paymt.save()
                        statusText = "created"
                    }


                }
                result.push({
                    ...payment,
                    status: statusText
                })
            }
        }
        return res.status(200).json(result);
    }
    public async DownloadExcelTemplateForCreatePayments(req: Request, res: Response, next: NextFunction) {
        let payments: GetPaymentsFromExcelDto[] = [{
            _id: "umc3m9344343vn934",
            category: 'maintenance',
            payment_title: 'machine work',
            payment_description: 'please check all the parts',
            link: 'http://www.bo.agarson.in',
            duedate: '13-10-2024',
            assigned_users: 'sujata,pawan',
            frequency: "monthly"
        }]


        let users = (await User.find()).map((u) => { return { name: u.username } })
        let categories = (await PaymentCategory.find()).map((u) => { return { name: u.category } })
        let categoriesids = await PaymentCategory.find()
        let dt = await Payment.find({ category: { $in: categoriesids } }).populate('category').populate('assigned_users')
        if (dt && dt.length > 0)
            payments = dt.map((ch) => {
                return {
                    _id: ch._id.valueOf(),
                    category: ch.category && ch.category.category || "",
                    payment_title: ch.payment_title,
                    payment_description: ch.payment_description,
                    link: ch.link,
                    assigned_users: ch.assigned_users.map((a) => { return a.username }).toString(),
                    duedate: moment(ch.due_date).format("DD-MM-yyyy"),
                    frequency: ch.frequency
                }
            })

        console.log(payments)
        let template: { sheet_name: string, data: any[] }[] = []
        template.push({ sheet_name: 'template', data: payments })
        template.push({ sheet_name: 'categories', data: categories })
        template.push({ sheet_name: 'users', data: users })
        template.push({ sheet_name: 'frequency', data: [{ frequency: "monthly" }, { frequency: "quarterly" }, { frequency: "yearly" }] })
        ConvertJsonToExcel(template)
        let fileName = "CreatePaymentTemplate.xlsx"
        return res.download("./file", fileName)
    }
    public async AssignPaymentsToUsers(req: Request, res: Response, next: NextFunction) {
        const { payment_ids, user_ids, flag } = req.body as { payment_ids: string[], user_ids: string[], flag: number }
        if (payment_ids && payment_ids.length === 0)
            return res.status(400).json({ message: "please select one payment " })
        if (user_ids && user_ids.length === 0)
            return res.status(400).json({ message: "please select one user" })


        if (flag == 0) {
            for (let k = 0; k < payment_ids.length; k++) {
                let payment = await Payment.findById({ _id: payment_ids[k] }).populate('assigned_users')

                if (payment) {
                    let oldusers = payment.assigned_users.map((item) => { return item._id.valueOf() });
                    oldusers = oldusers.filter((item) => { return !user_ids.includes(item) });
                    await Payment.findByIdAndUpdate(payment._id, {
                        assigned_users: oldusers
                    })
                }
            }
        }
        else {
            for (let k = 0; k < payment_ids.length; k++) {
                let payment = await Payment.findById({ _id: payment_ids[k] }).populate('assigned_users')

                if (payment) {
                    let oldusers = payment.assigned_users.map((item) => { return item._id.valueOf() });

                    user_ids.forEach((id) => {
                        if (!oldusers.includes(id))
                            oldusers.push(id)
                    })

                    await Payment.findByIdAndUpdate(payment._id, {
                        assigned_users: oldusers
                    })
                }
            }
        }

        return res.status(200).json({ message: "successfull" })
    }
    public async BulkDeletePayments(req: Request, res: Response, next: NextFunction) {
        const { ids } = req.body as { ids: string[] }
        for (let i = 0; i < ids.length; i++) {
            let payment = await Payment.findById(ids[i])
            if (!payment) {
                return res.status(404).json({ message: "Payment not found" })
            }
            let docs = await PaymentDocument.find({ payment: payment._id })
            for (let i = 0; i < docs.length; i++) {
                let doc = docs[i]
                if (doc.document && doc.document?._id)
                    await destroyCloudFile(doc.document._id)
                await PaymentDocument.findByIdAndDelete(doc._id)
            }
            await payment.remove()
        }
        return res.status(200).json({ message: "payments are deleted" })
    }


    public async GetProductions(req: Request, res: Response, next: NextFunction) {
        let limit = Number(req.query.limit)
        let page = Number(req.query.page)
        let id = req.query.id
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let productions: IProduction[] = []
        let result: GetProductionDto[] = []
        let count = 0
        let dt1 = new Date(String(start_date))
        let dt2 = new Date(String(end_date))
        let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []

        if (!Number.isNaN(limit) && !Number.isNaN(page)) {
            if (!id) {
                if (user_ids.length > 0) {
                    productions = await Production.find({ date: { $gte: dt1, $lt: dt2 }, thekedar: { $in: user_ids } }).populate('machine').populate('thekedar').populate('articles').populate('created_by').populate('updated_by').sort('date').skip((page - 1) * limit).limit(limit)
                    count = await Production.find({ date: { $gte: dt1, $lt: dt2 }, thekedar: { $in: user_ids } }).countDocuments()
                }

                else {
                    productions = await Production.find({ date: { $gte: dt1, $lt: dt2 }, thekedar: req.user?._id }).populate('machine').populate('thekedar').populate('articles').populate('created_by').populate('updated_by').sort('date').skip((page - 1) * limit).limit(limit)
                    count = await Production.find({ date: { $gte: dt1, $lt: dt2 }, thekedar: req.user?._id }).countDocuments()
                }
            }


            if (id) {
                productions = await Production.find({ date: { $gte: dt1, $lt: dt2 }, thekedar: id }).populate('machine').populate('thekedar').populate('articles').populate('created_by').populate('updated_by').sort('date').skip((page - 1) * limit).limit(limit)
                count = await Production.find({ date: { $gte: dt1, $lt: dt2 }, thekedar: id }).countDocuments()
            }
            result = productions.map((p) => {
                return {
                    _id: p._id,
                    machine: { id: p.machine._id, value: p.machine.name, label: p.machine.name },
                    thekedar: { id: p.thekedar._id, value: p.thekedar.username, label: p.thekedar.username },
                    articles: p.articles.map((a) => { return { id: a._id, value: a.name, label: a.name } }),
                    manpower: p.manpower,
                    production: p.production,
                    big_repair: p.big_repair,
                    upper_damage: p.upper_damage,
                    small_repair: p.small_repair,
                    date: p.date && moment(p.date).format("DD/MM/YYYY"),
                    production_hours: p.production_hours,
                    created_at: p.created_at && moment(p.created_at).format("DD/MM/YYYY"),
                    updated_at: p.updated_at && moment(p.updated_at).format("DD/MM/YYYY"),
                    created_by: { id: p.created_by._id, value: p.created_by.username, label: p.created_by.username },
                    updated_by: { id: p.updated_by._id, value: p.updated_by.username, label: p.updated_by.username }
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


    public async GetMyTodayProductions(req: Request, res: Response, next: NextFunction) {
        let machine = req.query.machine
        let date = String(req.query.date)
        let dt1 = new Date(date)
        let dt2 = new Date(date)
        dt2.setDate(dt1.getDate() + 1)
        let productions: IProduction[] = []
        let result: GetProductionDto[] = []
        if (machine) {
            productions = await Production.find({ date: { $gte: dt1, $lt: dt2 }, machine: machine }).populate('machine').populate('thekedar').populate('articles').populate('created_by').populate('updated_by').sort('-updated_at')
        }
        if (!machine)
            productions = await Production.find({ date: { $gte: dt1, $lt: dt2 } }).populate('machine').populate('thekedar').populate('articles').populate('created_by').populate('updated_by').sort('-updated_at')

        result = productions.map((p) => {
            return {
                _id: p._id,
                machine: { id: p.machine._id, value: p.machine.name, label: p.machine.name },
                thekedar: { id: p.thekedar._id, value: p.thekedar.username, label: p.thekedar.username },
                articles: p.articles.map((a) => { return { id: a._id, value: a.name, label: a.name } }),
                manpower: p.manpower,
                production: p.production,
                big_repair: p.big_repair,
                upper_damage: p.upper_damage,
                small_repair: p.small_repair,
                date: p.date && moment(p.date).format("DD/MM/YYYY"),
                production_hours: p.production_hours,
                created_at: p.created_at && moment(p.created_at).format("DD/MM/YYYY"),
                updated_at: p.updated_at && moment(p.updated_at).format("DD/MM/YYYY"),
                created_by: { id: p.created_by._id, value: p.created_by.username, label: p.created_by.username },
                updated_by: { id: p.updated_by._id, value: p.updated_by.username, label: p.updated_by.username }
            }
        })
        return res.status(200).json(productions)
    }
    public async CreateProduction(req: Request, res: Response, next: NextFunction) {
        let {
            machine,
            thekedar,
            articles,
            manpower,
            production,
            big_repair,
            production_hours,
            small_repair,
            date,
            upper_damage
        } = req.body as CreateOrEditProductionDto
        let previous_date = new Date()
        let day = previous_date.getDate() - 3
        previous_date.setDate(day)
        // if (new Date(date) < previous_date || new Date(date) > new Date())
        //     return res.status(400).json({ message: "invalid date, should be within last 2 days" })

        let previous_date2 = new Date(date)
        let day2 = previous_date2.getDate() - 3
        previous_date2.setDate(day2)

        let prods = await Production.find({ created_at: { $gte: previous_date2 }, machine: machine })
        prods = prods.filter((prod) => {
            if (prod.date.getDate() === new Date(date).getDate() && prod.date.getMonth() === new Date(date).getMonth() && prod.date.getFullYear() === new Date(date).getFullYear()) {
                return prod
            }
        })
        if (prods.length === 2)
            return res.status(400).json({ message: "not allowed more than 2 productions for the same machine" })

        if (!machine || !thekedar || !articles || !manpower || !production || !date)
            return res.status(400).json({ message: "please fill all reqired fields" })


        let production_date = new Date(date)


        if (articles.length === 0) {
            return res.status(400).json({ message: "select an article" })
        }
        let m1 = await Machine.findById(machine)
        let t1 = await User.findById(thekedar)

        if (!m1 || !t1)
            return res.status(400).json({ message: "not a valid request" })
        let new_prouction = new Production({
            machine: m1,
            thekedar: t1,
            production_hours: production_hours,
            articles: articles,
            manpower: manpower,
            production: production,
            big_repair: big_repair,
            small_repair: small_repair,
            upper_damage: upper_damage
        })

        new_prouction.date = production_date
        new_prouction.created_at = new Date()
        new_prouction.updated_at = new Date()
        if (req.user) {
            new_prouction.created_by = req.user
            new_prouction.updated_by = req.user
        }
        await new_prouction.save()
        return res.status(201).json(new_prouction)
    }

    public async UpdateProduction(req: Request, res: Response, next: NextFunction) {
        let {
            machine,
            thekedar,
            articles,
            production_hours,
            manpower,
            production,
            big_repair,
            small_repair,
            upper_damage,
            date
        } = req.body as CreateOrEditProductionDto
        let previous_date = new Date()
        let day = previous_date.getDate() - 3
        previous_date.setDate(day)

        // if (new Date(date) < previous_date || new Date(date) > new Date())
        //     return res.status(400).json({ message: "invalid date, should be within last 2 days" })
        if (!machine || !thekedar || !articles || !manpower || !production || !date)
            return res.status(400).json({ message: "please fill all reqired fields" })
        const id = req.params.id
        if (!id)
            return res.status(400).json({ message: "not a valid request" })
        let remote_production = await Production.findById(id)


        if (!remote_production)
            return res.status(404).json({ message: "producton not exists" })

        if (articles.length === 0) {
            return res.status(400).json({ message: "select an article" })
        }
        let m1 = await Machine.findById(machine)
        let t1 = await User.findById(thekedar)

        if (!m1 || !t1)
            return res.status(400).json({ message: "not a valid request" })
        await Production.findByIdAndUpdate(remote_production._id,
            {
                machine: m1,
                thekedar: t1,
                articles: articles,
                manpower: manpower,
                production: production,
                production_hours: production_hours,
                big_repair: big_repair,
                small_repair: small_repair,
                upper_damage: upper_damage,
                created_at: new Date(),
                updated_at: new Date(),
                updated_by: req.user
            })
        return res.status(200).json({ message: "production updated" })
    }
    public async DeleteProduction(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id
        if (!id)
            return res.status(400).json({ message: "not a valid request" })
        let remote_production = await Production.findById(id)
        if (!remote_production)
            return res.status(404).json({ message: "producton not exists" })

        await Production.findByIdAndDelete(remote_production._id)
        return res.status(200).json({ message: "production removed" })
    }


    public async MergeTwoRefers(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        const { name, mobiles, city, state, address, merge_assigned_refers, merge_bills, merge_remarks, source_refer_id } = req.body as CreateOrEditMergeRefersDto
        let refer = await ReferredParty.findById(id);
        let sourcerefer = await ReferredParty.findById(source_refer_id);

        if (!refer || !sourcerefer)
            return res.status(404).json({ message: "refers not found" })

        await ReferredParty.findByIdAndUpdate(id, {
            name: name,
            city: city,
            state: state,
            mobile: mobiles[0] || null,
            mobile2: mobiles[1] || null,
            mobile3: mobiles[2] || null,
            address: address
        });

        if (merge_assigned_refers) {
            await Lead.updateMany({ referred_party: source_refer_id }, { referred_party: id });
        }
        if (merge_remarks) {
            await Remark.updateMany({ refer: source_refer_id }, { refer: id });
        }
        if (merge_bills) {
            await Bill.updateMany({ refer: source_refer_id }, { refer: id });
        }
        await ReferredParty.findByIdAndDelete(source_refer_id);
        return res.status(200).json({ message: "merge refers successfully" })
    }

    public async GetRefers(req: Request, res: Response, next: NextFunction) {
        let refers: IReferredParty[] = []
        let result: GetReferDto[] = []
        let user = await User.findById(req.user).populate('assigned_crm_states').populate('assigned_crm_cities');
        let states = user?.assigned_crm_states.map((item) => { return item.state })
        let cities = user?.assigned_crm_cities.map((item) => { return item.city })
        refers = await ReferredParty.find({ 'state': { $in: states }, 'city': { $in: cities } }).sort('name')

        result = refers.map((r) => {
            return {
                _id: r._id,
                name: r.name,
                last_remark: r.last_remark,
                refers: 0,
                uploaded_bills: r.uploaded_bills,
                customer_name: r.customer_name,
                mobile: r.mobile,
                mobile2: r.mobile2,
                mobile3: r.mobile3,
                address: r.address,
                gst: r.gst,
                city: r.city,
                state: r.state,
                convertedfromlead: r.convertedfromlead,
                created_at: moment(r.created_at).format("DD/MM/YYYY"),
                updated_at: moment(r.updated_at).format("DD/MM/YYYY"),
                created_by: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username },
                updated_by: { id: r.updated_by._id, value: r.updated_by.username, label: r.updated_by.username },
            }
        })

        return res.status(200).json(refers);
    }


    public async GetPaginatedRefers(req: Request, res: Response, next: NextFunction) {
        let limit = Number(req.query.limit)
        let page = Number(req.query.page)
        let result: GetReferDto[] = []
        let user = await User.findById(req.user).populate('assigned_crm_states').populate('assigned_crm_cities');
        let states = user?.assigned_crm_states.map((item) => { return item.state })
        let cities = user?.assigned_crm_cities.map((item) => { return item.city })
        let parties: IReferredParty[] = []
        if (!Number.isNaN(limit) && !Number.isNaN(page)) {
            parties = await ReferredParty.find({ state: { $in: states }, city: { $in: cities } }).populate('created_by').populate('updated_by').sort('-updated_at')
            let count = parties.length
            parties = parties.slice((page - 1) * limit, limit * page)
            result = parties.map((r) => {
                return {
                    _id: r._id,
                    name: r.name,
                    refers: r.refers,
                    last_remark: r.last_remark,
                    customer_name: r.customer_name,
                    mobile: r.mobile,
                    mobile2: r.mobile2,
                    mobile3: r.mobile3,
                    uploaded_bills: r.uploaded_bills,
                    address: r.address,
                    gst: r.gst,
                    city: r.city,
                    state: r.state,
                    convertedfromlead: r.convertedfromlead,
                    created_at: moment(r.created_at).format("DD/MM/YYYY"),
                    updated_at: moment(r.updated_at).format("DD/MM/YYYY"),
                    created_by: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username },
                    updated_by: { id: r.updated_by._id, value: r.updated_by.username, label: r.updated_by.username },
                }
            })
            return res.status(200).json({
                result: result,
                total: Math.ceil(count / limit),
                page: page,
                limit: limit
            })
        }
        else return res.status(400).json({ message: 'bad request' })

    }


    public async FuzzySearchRefers(req: Request, res: Response, next: NextFunction) {
        let limit = Number(req.query.limit)
        let page = Number(req.query.page)
        let key = String(req.query.key).split(",")
        let user = await User.findById(req.user).populate('assigned_crm_states').populate('assigned_crm_cities');
        let states = user?.assigned_crm_states.map((item) => { return item.state })
        let cities = user?.assigned_crm_cities.map((item) => { return item.city })
        let result: GetReferDto[] = []
        if (!key)
            return res.status(500).json({ message: "bad request" })
        let parties: IReferredParty[] = []
        if (!Number.isNaN(limit) && !Number.isNaN(page)) {
            if (key.length == 1 || key.length > 4) {

                parties = await ReferredParty.find({
                    state: { $in: states }, city: { $in: cities },
                    $or: [
                        { name: { $regex: key[0], $options: 'i' } },
                        { gst: { $regex: key[0], $options: 'i' } },
                        { customer_name: { $regex: key[0], $options: 'i' } },
                        { mobile: { $regex: key[0], $options: 'i' } },
                        { mobile2: { $regex: key[0], $options: 'i' } },
                        { mobile3: { $regex: key[0], $options: 'i' } },
                        { city: { $regex: key[0], $options: 'i' } },
                        { state: { $regex: key[0], $options: 'i' } },
                    ]
                }).populate('created_by').populate('updated_by').sort('-updated_at')

            }
            if (key.length == 2) {

                parties = await ReferredParty.find({
                    state: { $in: states }, city: { $in: cities },

                    $and: [
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { gst: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { mobile2: { $regex: key[0], $options: 'i' } },
                                { mobile3: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { gst: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { mobile2: { $regex: key[0], $options: 'i' } },
                                { mobile3: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        }
                    ]
                    ,

                }
                ).populate('created_by').populate('updated_by').sort('-updated_at')

            }

            if (key.length == 3) {

                parties = await ReferredParty.find({
                    state: { $in: states }, city: { $in: cities },

                    $and: [
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { gst: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { mobile2: { $regex: key[0], $options: 'i' } },
                                { mobile3: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { gst: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { mobile2: { $regex: key[0], $options: 'i' } },
                                { mobile3: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { gst: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { mobile2: { $regex: key[0], $options: 'i' } },
                                { mobile3: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        }
                    ]
                    ,

                }
                ).populate('created_by').populate('updated_by').sort('-updated_at')

            }
            if (key.length == 4) {

                parties = await ReferredParty.find({
                    state: { $in: states }, city: { $in: cities },
                    $and: [
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { gst: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { mobile2: { $regex: key[0], $options: 'i' } },
                                { mobile3: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { gst: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { mobile2: { $regex: key[0], $options: 'i' } },
                                { mobile3: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { gst: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { mobile2: { $regex: key[0], $options: 'i' } },
                                { mobile3: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { gst: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { mobile2: { $regex: key[0], $options: 'i' } },
                                { mobile3: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        }
                    ]
                    ,

                }
                ).populate('created_by').populate('updated_by').sort('-updated_at')

            }

            let count = parties.length
            parties = parties.slice((page - 1) * limit, limit * page)
            result = parties.map((r) => {
                return {
                    _id: r._id,
                    name: r.name,
                    refers: r.refers,
                    last_remark: r?.last_remark || "",
                    customer_name: r.customer_name,
                    uploaded_bills: r.uploaded_bills,
                    mobile: r.mobile,
                    mobile2: r.mobile2,
                    mobile3: r.mobile3,
                    address: r.address,
                    gst: r.gst,
                    city: r.city,
                    state: r.state,
                    convertedfromlead: r.convertedfromlead,
                    created_at: moment(r.created_at).format("DD/MM/YYYY"),
                    updated_at: moment(r.updated_at).format("DD/MM/YYYY"),
                    created_by: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username },
                    updated_by: { id: r.updated_by._id, value: r.updated_by.username, label: r.updated_by.username },
                }
            })
            return res.status(200).json({
                result: result,
                total: Math.ceil(count / limit),
                page: page,
                limit: limit
            })
        }

        else
            return res.status(400).json({ message: "bad request" })

    }


    public async CreateReferParty(req: Request, res: Response, next: NextFunction) {
        let body = JSON.parse(req.body.body)
        const { name, customer_name, city, state, gst, mobile, mobile2, mobile3 } = body as CreateOrEditReferDto
        if (!name || !city || !state || !mobile || !gst) {
            return res.status(400).json({ message: "please fill all required fields" })
        }

        let uniqueNumbers = []
        if (mobile)
            uniqueNumbers.push(mobile)
        if (mobile2)
            uniqueNumbers.push(mobile2)
        if (mobile3)
            uniqueNumbers.push(mobile3)

        uniqueNumbers = uniqueNumbers.filter((item, i, ar) => ar.indexOf(item) === i);

        if (uniqueNumbers[0] && await ReferredParty.findOne({ $or: [{ mobile: uniqueNumbers[0] }, { mobile2: uniqueNumbers[0] }, { mobile3: uniqueNumbers[0] }] }))
            return res.status(400).json({ message: `${mobile} already exists ` })


        if (uniqueNumbers[1] && await ReferredParty.findOne({ $or: [{ mobile: uniqueNumbers[1] }, { mobile2: uniqueNumbers[1] }, { mobile3: uniqueNumbers[1] }] }))
            return res.status(400).json({ message: `${uniqueNumbers[1]} already exists ` })

        if (uniqueNumbers[2] && await ReferredParty.findOne({ $or: [{ mobile: uniqueNumbers[2] }, { mobile2: uniqueNumbers[2] }, { mobile3: uniqueNumbers[2] }] }))
            return res.status(400).json({ message: `${uniqueNumbers[2]} already exists ` })


        let resultParty = await ReferredParty.findOne({ $or: [{ gst: String(gst).toLowerCase().trim() }, { mobile: String(mobile).toLowerCase().trim() }] })
        if (resultParty) {
            return res.status(400).json({ message: "already exists  gst" })
        }


        let party = await new ReferredParty({
            name, customer_name, city, state,
            mobile: uniqueNumbers[0] || null,
            mobile2: uniqueNumbers[1] || null,
            mobile3: uniqueNumbers[2] || null,
            gst,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
        return res.status(201).json(party)
    }

    public async UpdateReferParty(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id
        if (!isMongoId(id))
            return res.status(400).json({ message: "bad mongo id" })
        let body = JSON.parse(req.body.body)
        const { name, customer_name, city, state, mobile, mobile2, mobile3, gst } = body as CreateOrEditReferDto
        if (!name || !city || !state || !mobile) {
            return res.status(400).json({ message: "please fill all required fields" })
        }
        let party = await ReferredParty.findById(id)

        if (!party)
            return res.status(404).json({ message: "party not found" })
        if (gst !== party.gst) {
            let resultParty = await ReferredParty.findOne({ gst: gst });
            if (resultParty) {
                return res.status(400).json({ message: "already exists this  gst" })
            }
        }
        let uniqueNumbers = []
        if (mobile) {
            if (mobile === party.mobile) {
                uniqueNumbers[0] = party.mobile
            }
            if (mobile !== party.mobile) {
                uniqueNumbers[0] = mobile
            }
        }
        if (mobile2) {
            if (mobile2 === party.mobile2) {
                uniqueNumbers[1] = party.mobile2
            }
            if (mobile2 !== party.mobile2) {
                uniqueNumbers[1] = mobile2
            }
        }
        if (mobile3) {
            if (mobile3 === party.mobile3) {
                uniqueNumbers[2] = party.mobile3
            }
            if (mobile3 !== party.mobile3) {
                uniqueNumbers[2] = mobile3
            }
        }

        uniqueNumbers = uniqueNumbers.filter((item, i, ar) => ar.indexOf(item) === i);


        if (uniqueNumbers[0] && uniqueNumbers[0] !== party.mobile && await ReferredParty.findOne({ $or: [{ mobile: uniqueNumbers[0] }, { mobile2: uniqueNumbers[0] }, { mobile3: uniqueNumbers[0] }] }))
            return res.status(400).json({ message: `${mobile} already exists ` })


        if (uniqueNumbers[1] && uniqueNumbers[1] !== party.mobile2 && await ReferredParty.findOne({ $or: [{ mobile: uniqueNumbers[1] }, { mobile2: uniqueNumbers[1] }, { mobile3: uniqueNumbers[1] }] }))
            return res.status(400).json({ message: `${uniqueNumbers[1]} already exists ` })

        if (uniqueNumbers[2] && uniqueNumbers[2] !== party.mobile3 && await ReferredParty.findOne({ $or: [{ mobile: uniqueNumbers[2] }, { mobile2: uniqueNumbers[2] }, { mobile3: uniqueNumbers[2] }] }))
            return res.status(400).json({ message: `${uniqueNumbers[2]} already exists ` })

        await ReferredParty.findByIdAndUpdate(id, {
            name, customer_name, city, state,
            mobile: uniqueNumbers[0] || null,
            mobile2: uniqueNumbers[1] || null,
            mobile3: uniqueNumbers[2] || null,
            gst,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        })
        return res.status(200).json({ message: "updated" })
    }


    public async DeleteReferParty(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id
        if (!isMongoId(id))
            return res.status(400).json({ message: "bad mongo id" })
        let party = await ReferredParty.findById(id)
        if (!party)
            return res.status(404).json({ message: "party not found" })
        await ReferredParty.findByIdAndDelete(id)
        return res.status(200).json({ message: "deleted" })
    }


    public async ToogleReferPartyConversion(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id
        if (!isMongoId(id))
            return res.status(400).json({ message: "bad mongo id" })
        let party = await ReferredParty.findById(id)
        if (!party)
            return res.status(404).json({ message: "party not found" })
        await ReferredParty.findByIdAndUpdate(id, { convertedfromlead: !party.convertedfromlead })
        return res.status(200).json({ message: "converted successfully" })
    }

    public async BulkReferUpdateFromExcel(req: Request, res: Response, next: NextFunction) {
        let result: GetReferFromExcelDto[] = []
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
            let workbook_response: GetReferFromExcelDto[] = xlsx.utils.sheet_to_json(
                workbook.Sheets[workbook_sheet[0]]
            );
            if (workbook_response.length > 3000) {
                return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
            }
            for (let i = 0; i < workbook_response.length; i++) {
                let refer = workbook_response[i]
                let name: string | null = refer.name
                let mobile: string | null = refer.mobile
                let city: string | null = refer.city
                let state: string | null = refer.state
                let gst: string | null = refer.gst

                let validated = true

                //important
                if (!mobile) {
                    validated = false
                    statusText = "required mobile"
                }
                if (!name) {
                    validated = false
                    statusText = "required name"
                }
                if (!city) {
                    validated = false
                    statusText = "required city"
                }
                if (!state) {
                    validated = false
                    statusText = "required state"
                }
                if (!gst) {
                    validated = false
                    statusText = "required gst"
                }
                if (gst && gst.length !== 15) {
                    validated = false
                    statusText = "invalid gst"
                }
                if (mobile && Number.isNaN(Number(mobile))) {
                    validated = false
                    statusText = "invalid mobile"
                }


                if (mobile && String(mobile).length !== 10) {
                    validated = false
                    statusText = "invalid mobile"
                }
                //update and create new nead
                if (validated) {
                    if (refer._id && isMongoId(String(refer._id))) {
                        let targetLead = await ReferredParty.findById(refer._id)
                        if (targetLead) {
                            if (targetLead.mobile != String(mobile).toLowerCase().trim() || targetLead.gst !== String(gst).toLowerCase().trim()) {
                                let refertmp = await ReferredParty.findOne({ mobile: String(mobile).toLowerCase().trim() })
                                let refertmp2 = await ReferredParty.findOne({ gst: String(gst).toLowerCase().trim() })

                                if (refertmp) {
                                    validated = false
                                    statusText = "exists mobile"
                                }
                                if (refertmp2) {
                                    validated = false
                                    statusText = "exists  gst"
                                }
                                else {
                                    await ReferredParty.findByIdAndUpdate(refer._id, {
                                        ...refer,
                                        city: city ? city : "unknown",
                                        state: state ? state : "unknown",
                                        updated_by: req.user,
                                        updated_at: new Date(Date.now())
                                    })
                                    statusText = "updated"
                                }
                            }
                        }
                    }

                    if (!refer._id || !isMongoId(String(refer._id))) {
                        let refertmp = await ReferredParty.findOne({
                            $or: [
                                { mobile: String(mobile).toLowerCase().trim() },
                                { gst: String(gst).toLowerCase().trim() }
                            ]
                        })
                        if (refertmp) {
                            validated = false
                            statusText = "duplicate mobile or gst"
                        }
                        else {
                            let referParty = new ReferredParty({
                                ...refer,
                                _id: new Types.ObjectId(),
                                city: city ? city : "unknown",
                                state: state ? state : "unknown",
                                mobile: refer.mobile,
                                created_by: req.user,
                                updated_by: req.user,
                                updated_at: new Date(Date.now()),
                                created_at: new Date(Date.now()),
                                remarks: undefined
                            })

                            await referParty.save()
                            statusText = "created"
                        }

                    }
                }
                result.push({
                    ...refer,
                    status: statusText
                })
            }
        }
        return res.status(200).json(result);
    }

    public async GetMyTodayShoeWeights(req: Request, res: Response, next: NextFunction) {
        let dt1 = new Date()
        dt1.setDate(new Date().getDate())
        dt1.setHours(0)
        dt1.setMinutes(0)
        let result: GetShoeWeightDto[] = []
        let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []
        let weights: IShoeWeight[] = []

        if (user_ids.length > 0) {
            weights = await ShoeWeight.find({ created_at: { $gte: dt1 }, created_by: { $in: user_ids } }).populate('machine').populate('dye').populate('article').populate('created_by').populate('updated_by').sort('-updated_at')
        }
        else {
            weights = await ShoeWeight.find({ created_at: { $gte: dt1 }, created_by: req.user?._id }).populate('machine').populate('dye').populate('article').populate('created_by').populate('updated_by').sort('-updated_at')
        }
        result = weights.map((w) => {
            return {
                _id: w._id,
                machine: { id: w.machine._id, label: w.machine.name, value: w.machine.name },
                dye: { id: w.dye._id, label: String(w.dye.dye_number), value: String(w.dye.dye_number) },
                article: { id: w.article._id, label: w.article.name, value: w.article.name },
                is_validated: w.is_validated,
                month: w.month,
                std_weigtht: w.dye.stdshoe_weight || 0,
                size: w.dye.size || "",
                shoe_weight1: w.shoe_weight1,
                shoe_photo1: w.shoe_photo1?.public_url || "",
                weighttime1: moment(new Date(w.weighttime1)).format('LT'),
                weighttime2: moment(new Date(w.weighttime2)).format('LT'),
                weighttime3: moment(new Date(w.weighttime3)).format('LT'),
                upper_weight1: w.upper_weight1,
                upper_weight2: w.upper_weight2,
                upper_weight3: w.upper_weight3,
                shoe_weight2: w.shoe_weight2,
                shoe_photo2: w.shoe_photo2?.public_url || "",
                shoe_weight3: w.shoe_weight3,
                shoe_photo3: w.shoe_photo3?.public_url || "",
                created_at: moment(w.created_at).format("DD/MM/YYYY"),
                updated_at: moment(w.updated_at).format("DD/MM/YYYY"),
                created_by: { id: w.created_by._id, value: w.created_by.username, label: w.created_by.username },
                updated_by: { id: w.updated_by._id, value: w.updated_by.username, label: w.updated_by.username },
            }
        })
        return res.status(200).json(result)
    }


    public async GetShoeWeights(req: Request, res: Response, next: NextFunction) {
        let limit = Number(req.query.limit)
        let page = Number(req.query.page)
        let id = req.query.id
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let weights: IShoeWeight[] = []
        let result: GetShoeWeightDto[] = []
        let count = 0
        let dt1 = new Date(String(start_date))
        dt1.setHours(0)
        dt1.setMinutes(0)
        let dt2 = new Date(String(end_date))
        dt2.setHours(0)
        dt2.setMinutes(0)
        let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []
        console.log(user_ids)
        if (!Number.isNaN(limit) && !Number.isNaN(page)) {
            if (!id) {
                if (user_ids.length > 0) {
                    weights = await ShoeWeight.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: user_ids } }).populate('dye').populate('machine').populate('article').populate('created_by').populate('updated_by').sort("-created_at").skip((page - 1) * limit).limit(limit)
                    count = await ShoeWeight.find({ created_at: { $gt: dt1, $lt: dt2 }, created_by: { $in: user_ids } }).countDocuments()
                }

                else {
                    weights = await ShoeWeight.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).populate('dye').populate('machine').populate('article').populate('created_by').populate('updated_by').sort("-created_at").skip((page - 1) * limit).limit(limit)
                    count = await ShoeWeight.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).countDocuments()
                }
                console.log(weights.length)
            }


            if (id) {
                weights = await ShoeWeight.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).populate('dye').populate('machine').populate('article').populate('created_by').populate('updated_by').sort("-created_at").skip((page - 1) * limit).limit(limit)
                count = await ShoeWeight.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).countDocuments()
            }
            result = weights.map((w) => {
                return {
                    _id: w._id,
                    machine: { id: w.machine._id, label: w.machine.name, value: w.machine.name },
                    dye: { id: w.dye._id, label: String(w.dye.dye_number), value: String(w.dye.dye_number) },
                    article: { id: w.article._id, label: w.article.name, value: w.article.name },
                    size: w.dye.size || "",
                    is_validated: w.is_validated,
                    month: w.month,
                    std_weigtht: w.dye.stdshoe_weight || 0,
                    shoe_weight1: w.shoe_weight1,
                    shoe_photo1: w.shoe_photo1?.public_url || "",
                    weighttime1: moment(new Date(w.weighttime1)).format('LT'),
                    weighttime2: moment(new Date(w.weighttime2)).format('LT'),
                    weighttime3: moment(new Date(w.weighttime3)).format('LT'),
                    upper_weight1: w.upper_weight1,
                    upper_weight2: w.upper_weight2,
                    upper_weight3: w.upper_weight3,
                    shoe_weight2: w.shoe_weight2,
                    shoe_photo2: w.shoe_photo2?.public_url || "",
                    shoe_weight3: w.shoe_weight3,
                    shoe_photo3: w.shoe_photo3?.public_url || "",
                    created_at: moment(w.created_at).format("DD/MM/YYYY"),
                    updated_at: moment(w.updated_at).format("DD/MM/YYYY"),
                    created_by: { id: w.created_by._id, value: w.created_by.username, label: w.created_by.username },
                    updated_by: { id: w.updated_by._id, value: w.updated_by.username, label: w.updated_by.username },
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
            return res.status(200).json({ message: "bad request" })
    }

    public async CreateShoeWeight(req: Request, res: Response, next: NextFunction) {
        let body = JSON.parse(req.body.body) as CreateOrEditShoeWeightDto

        let dt1 = new Date()
        let dt2 = new Date()
        dt2.setDate(new Date(dt2).getDate() + 1)
        dt1.setHours(0)
        dt1.setMinutes(0)
        let { machine, dye, article, weight, month, upper_weight } = body

        if (!machine || !dye || !article || !weight || !upper_weight)
            return res.status(400).json({ message: "please fill all reqired fields" })

        let m1 = await Machine.findById(machine)
        let d1 = await Dye.findById(dye)
        let art1 = await Article.findById(article)
        if (!m1 || !d1 || !art1)
            return res.status(400).json({ message: "please fill all reqired fields" })
        if (await SpareDye.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
            return res.status(400).json({ message: "sorry ! this is a spare dye" })
        }

        if (await ShoeWeight.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
            return res.status(400).json({ message: "sorry ! dye is not available" })
        }


        let shoe_weight = new ShoeWeight({
            machine: m1, dye: d1, article: art1, shoe_weight1: weight, month: month, upper_weight1: upper_weight
        })
        if (req.file) {
            console.log(req.file.mimetype)
            const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
            const storageLocation = `weights/media`;
            if (!allowedFiles.includes(req.file.mimetype))
                return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
            if (req.file.size > 20 * 1024 * 1024)
                return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
            const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
            if (doc)
                shoe_weight.shoe_photo1 = doc
            else {
                return res.status(500).json({ message: "file uploading error" })
            }
        }
        shoe_weight.created_at = new Date()
        shoe_weight.updated_at = new Date()
        if (req.user)
            shoe_weight.created_by = req.user
        if (req.user)
            shoe_weight.updated_by = req.user
        shoe_weight.weighttime1 = new Date()
        await shoe_weight.save()
        return res.status(201).json(shoe_weight)
    }
    public async UpdateShoeWeight1(req: Request, res: Response, next: NextFunction) {
        let body = JSON.parse(req.body.body) as CreateOrEditShoeWeightDto
        let { machine, dye, article, weight, month, upper_weight } = body

        if (!machine || !dye || !article || !weight || !upper_weight)
            return res.status(400).json({ message: "please fill all reqired fields" })
        const id = req.params.id
        let shoe_weight = await ShoeWeight.findById(id)
        if (!shoe_weight)
            return res.status(404).json({ message: "shoe weight not found" })

        let m1 = await Machine.findById(machine)
        let d1 = await Dye.findById(dye)
        let art1 = await Article.findById(article)
        if (!m1 || !d1 || !art1)
            return res.status(400).json({ message: "please fill all reqired fields" })

        let dt1 = new Date()
        let dt2 = new Date()
        dt2.setDate(new Date(dt2).getDate() + 1)
        dt1.setHours(0)
        dt1.setMinutes(0)
        if (await SpareDye.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
            return res.status(400).json({ message: "sorry ! this is a spare dye" })
        }

        //@ts-ignore

        if (shoe_weight.dye !== dye)
            if (await ShoeWeight.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
                return res.status(400).json({ message: "sorry ! dye is not available" })
            }


        if (shoe_weight.shoe_photo1 && shoe_weight.shoe_photo1._id)
            await destroyCloudFile(shoe_weight.shoe_photo1._id)
        if (req.file) {
            console.log(req.file.mimetype)
            const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
            const storageLocation = `weights/media`;
            if (!allowedFiles.includes(req.file.mimetype))
                return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
            if (req.file.size > 20 * 1024 * 1024)
                return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
            const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
            if (doc)
                shoe_weight.shoe_photo1 = doc
            else {
                return res.status(500).json({ message: "file uploading error" })
            }
        }

        shoe_weight.machine = m1
        shoe_weight.dye = d1
        shoe_weight.month = month
        shoe_weight.upper_weight1 = upper_weight;
        shoe_weight.article = art1
        shoe_weight.shoe_weight1 = weight
        shoe_weight.created_at = new Date()
        shoe_weight.weighttime1 = new Date()
        shoe_weight.updated_at = new Date()
        if (req.user) {

            shoe_weight.created_by = req.user
            shoe_weight.updated_by = req.user
        }
        await shoe_weight.save()
        return res.status(200).json(shoe_weight)
    }
    public async UpdateShoeWeight2(req: Request, res: Response, next: NextFunction) {
        let body = JSON.parse(req.body.body) as CreateOrEditShoeWeightDto
        console.log(body)
        let { machine, dye, article, weight, month, upper_weight } = body

        if (!machine || !dye || !article || !weight || !upper_weight)
            return res.status(400).json({ message: "please fill all reqired fields" })
        const id = req.params.id
        let shoe_weight = await ShoeWeight.findById(id)
        if (!shoe_weight)
            return res.status(404).json({ message: "shoe weight not found" })

        let dt1 = new Date()
        let dt2 = new Date()
        dt2.setDate(new Date(dt2).getDate() + 1)
        dt1.setHours(0)
        dt1.setMinutes(0)
        if (await SpareDye.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
            return res.status(400).json({ message: "sorry ! this is a spare dye" })
        }

        //@ts-ignore
        if (shoe_weight.dye._id.valueOf() !== dye)
            if (await ShoeWeight.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
                return res.status(400).json({ message: "sorry ! dye is not available" })
            }


        let m1 = await Machine.findById(machine)
        let d1 = await Dye.findById(dye)
        let art1 = await Article.findById(article)
        if (!m1 || !d1 || !art1)
            return res.status(400).json({ message: "please fill  reqired fields" })
        if (shoe_weight.shoe_photo2 && shoe_weight.shoe_photo2._id)
            await destroyCloudFile(shoe_weight.shoe_photo2._id)
        if (req.file) {
            console.log(req.file.mimetype)
            const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
            const storageLocation = `weights/media`;
            if (!allowedFiles.includes(req.file.mimetype))
                return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
            if (req.file.size > 20 * 1024 * 1024)
                return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
            const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
            if (doc)
                shoe_weight.shoe_photo2 = doc
            else {
                return res.status(500).json({ message: "file uploading error" })
            }
        }

        shoe_weight.machine = m1
        shoe_weight.dye = d1
        shoe_weight.month = month
        shoe_weight.article = art1
        shoe_weight.upper_weight2 = upper_weight;
        shoe_weight.shoe_weight2 = weight
        shoe_weight.weighttime2 = new Date()
        shoe_weight.created_at = new Date()
        shoe_weight.updated_at = new Date()
        if (req.user) {
            shoe_weight.created_by = req.user
            shoe_weight.updated_by = req.user
        }
        await shoe_weight.save()
        return res.status(200).json(shoe_weight)
    }
    public async UpdateShoeWeight3(req: Request, res: Response, next: NextFunction) {
        let body = JSON.parse(req.body.body) as CreateOrEditShoeWeightDto
        let { machine, dye, article, weight, month, upper_weight } = body

        if (!machine || !dye || !article || !weight || !upper_weight)
            return res.status(400).json({ message: "please fill all reqired fields" })
        const id = req.params.id
        let shoe_weight = await ShoeWeight.findById(id)
        if (!shoe_weight)
            return res.status(404).json({ message: "shoe weight not found" })

        let dt1 = new Date()
        let dt2 = new Date()
        dt2.setDate(new Date(dt2).getDate() + 1)
        dt1.setHours(0)
        dt1.setMinutes(0)
        if (await SpareDye.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
            return res.status(400).json({ message: "sorry ! this is a spare dye" })
        }

        if (shoe_weight.dye._id.valueOf() !== dye)
            if (await ShoeWeight.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
                return res.status(400).json({ message: "sorry ! dye is not available" })
            }


        let m1 = await Machine.findById(machine)
        let d1 = await Dye.findById(dye)
        let art1 = await Article.findById(article)
        if (!m1 || !d1 || !art1)
            return res.status(400).json({ message: "please fill all reqired fields" })
        if (shoe_weight.shoe_photo3 && shoe_weight.shoe_photo3._id)
            await destroyCloudFile(shoe_weight.shoe_photo3._id)
        if (req.file) {
            console.log(req.file.mimetype)
            const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
            const storageLocation = `weights/media`;
            if (!allowedFiles.includes(req.file.mimetype))
                return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
            if (req.file.size > 20 * 1024 * 1024)
                return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
            const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
            if (doc)
                shoe_weight.shoe_photo3 = doc
            else {
                return res.status(500).json({ message: "file uploading error" })
            }
        }

        shoe_weight.machine = m1
        shoe_weight.upper_weight3 = upper_weight;
        shoe_weight.dye = d1
        shoe_weight.month = month
        shoe_weight.article = art1
        shoe_weight.shoe_weight3 = weight
        shoe_weight.created_at = new Date()
        shoe_weight.updated_at = new Date()
        shoe_weight.weighttime3 = new Date()
        if (req.user) {
            shoe_weight.created_by = req.user
            shoe_weight.updated_by = req.user
        }
        await shoe_weight.save()
        return res.status(200).json(shoe_weight)
    }

    public async ValidateShoeWeight(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id
        let shoe_weight = await ShoeWeight.findById(id)
        if (!shoe_weight)
            return res.status(404).json({ message: "shoe weight not found" })
        shoe_weight.is_validated = true
        shoe_weight.updated_at = new Date()
        if (req.user)
            shoe_weight.updated_by = req.user
        await shoe_weight.save()
        return res.status(200).json(shoe_weight)
    }
    public async ValidateSpareDye(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id
        let sparedye = await SpareDye.findById(id)
        if (!sparedye)
            return res.status(404).json({ message: "spare dye not found" })
        sparedye.is_validated = true
        sparedye.updated_at = new Date()
        if (req.user)
            sparedye.updated_by = req.user
        await sparedye.save()
        return res.status(200).json(sparedye)
    }
    public async DeleteShoeWeight(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id
        let shoe_weight = await ShoeWeight.findById(id)
        if (!shoe_weight)
            return res.status(404).json({ message: "shoe weight not found" })
        shoe_weight.is_validated = true
        shoe_weight.updated_at = new Date()
        if (req.user)
            shoe_weight.updated_by = req.user
        if (shoe_weight.shoe_photo1 && shoe_weight.shoe_photo1._id)
            await destroyCloudFile(shoe_weight.shoe_photo1._id)
        if (shoe_weight.shoe_photo2 && shoe_weight.shoe_photo2._id)
            await destroyCloudFile(shoe_weight.shoe_photo2._id)
        if (shoe_weight.shoe_photo3 && shoe_weight.shoe_photo3._id)
            await destroyCloudFile(shoe_weight.shoe_photo3._id)
        await shoe_weight.remove()
        return res.status(200).json(shoe_weight)
    }


    public async GetMyTodaySoleThickness(req: Request, res: Response, next: NextFunction) {
        console.log("enterd")
        let dt1 = new Date()
        dt1.setDate(new Date().getDate())
        dt1.setHours(0)
        dt1.setMinutes(0)
        let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []
        let items: ISoleThickness[] = []
        let result: GetSoleThicknessDto[] = []

        if (user_ids.length > 0) {
            items = await SoleThickness.find({ created_at: { $gte: dt1 }, created_by: { $in: user_ids } }).populate('dye').populate('article').populate('created_by').populate('updated_by').sort('-updated_at')
        }
        else {
            items = await SoleThickness.find({ created_at: { $gte: dt1 }, created_by: req.user?._id }).populate('dye').populate('article').populate('created_by').populate('updated_by').sort('-updated_at')
        }
        result = items.map((item) => {
            return {
                _id: item._id,
                dye: { id: item.dye._id, value: item.dye.dye_number.toString(), label: item.dye.dye_number.toString() },
                article: { id: item.article._id, value: item.article.name, label: item.article.name },
                size: item.size,
                left_thickness: item.left_thickness,
                right_thickness: item.right_thickness,
                created_at: item.created_at ? moment(item.created_at).format('LT') : "",
                updated_at: item.updated_at ? moment(item.updated_at).format('LT') : "",
                created_by: { id: item.created_by._id, value: item.created_by.username, label: item.created_by.username },
                updated_by: { id: item.updated_by._id, value: item.updated_by.username, label: item.updated_by.username }
            }
        })
        return res.status(200).json(result)
    }

    public async GetSoleThickness(req: Request, res: Response, next: NextFunction) {
        let limit = Number(req.query.limit)
        let page = Number(req.query.page)
        let id = req.query.id
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let result: GetSoleThicknessDto[] = []
        let items: ISoleThickness[] = []
        let count = 0
        let dt1 = new Date(String(start_date))
        dt1.setHours(0)
        dt1.setMinutes(0)
        let dt2 = new Date(String(end_date))
        dt2.setHours(0)
        dt2.setMinutes(0)
        let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []

        if (!Number.isNaN(limit) && !Number.isNaN(page)) {
            if (!id) {
                if (user_ids.length > 0) {
                    items = await SoleThickness.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: user_ids } }).populate('dye').populate('article').populate('created_by').populate('updated_by').sort("-created_at").skip((page - 1) * limit).limit(limit)
                    count = await SoleThickness.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: user_ids } }).countDocuments()
                }

                else {
                    items = await SoleThickness.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).populate('dye').populate('article').populate('created_by').populate('updated_by').sort("-created_at").skip((page - 1) * limit).limit(limit)
                    count = await SoleThickness.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).countDocuments()
                }
            }


            if (id) {
                items = await SoleThickness.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).populate('dye').populate('article').populate('created_by').populate('updated_by').sort("-created_at").skip((page - 1) * limit).limit(limit)
                count = await SoleThickness.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).countDocuments()
            }

            result = items.map((item) => {
                return {
                    _id: item._id,
                    dye: { id: item.dye._id, value: item.dye.dye_number.toString(), label: item.dye.dye_number.toString() },
                    article: { id: item.article._id, value: item.article.name, label: item.article.name },
                    size: item.size,
                    left_thickness: item.left_thickness,
                    right_thickness: item.right_thickness,
                    created_at: item.created_at ? moment(item.created_at).format('DD/MM/YYYY') : "",
                    updated_at: item.updated_at ? moment(item.updated_at).format('DD/MM/YYYY') : "",
                    created_by: { id: item.created_by._id, value: item.created_by.username, label: item.created_by.username },
                    updated_by: { id: item.updated_by._id, value: item.updated_by.username, label: item.updated_by.username }
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
            return res.status(200).json({ message: "bad request" })
    }
    public async CreateSoleThickness(req: Request, res: Response, next: NextFunction) {

        let dt1 = new Date()
        let dt2 = new Date()
        dt2.setDate(new Date(dt2).getDate() + 1)
        dt1.setHours(0)
        dt1.setMinutes(0)
        let { dye, article, size, left_thickness, right_thickness } = req.body as CreateOrEditSoleThicknessDto

        if (!size || !dye || !article || !left_thickness || !right_thickness)
            return res.status(400).json({ message: "please fill all reqired fields" })

        let d1 = await Dye.findById(dye)
        let art1 = await Article.findById(article)
        if (!d1 || !art1)
            return res.status(400).json({ message: "please fill all reqired fields" })


        if (await SoleThickness.findOne({ dye: dye, article: article, size: size, created_at: { $gte: dt1, $lt: dt2 } })) {
            return res.status(400).json({ message: "sorry !selected dye,article or size not available" })
        }
        let thickness = new SoleThickness({
            dye: d1, article: art1, size: size, left_thickness: left_thickness, right_thickness: right_thickness,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()

        return res.status(201).json(thickness)
    }
    public async UpdateSoleThickness(req: Request, res: Response, next: NextFunction) {
        let dt1 = new Date()
        let dt2 = new Date()
        dt2.setDate(new Date(dt2).getDate() + 1)
        dt1.setHours(0)
        dt1.setMinutes(0)
        let { dye, article, size, left_thickness, right_thickness } = req.body as CreateOrEditSoleThicknessDto

        if (!size || !dye || !article || !left_thickness || !right_thickness)
            return res.status(400).json({ message: "please fill all reqired fields" })
        const id = req.params.id
        let thickness = await SoleThickness.findById(id)
        if (!thickness)
            return res.status(404).json({ message: "not found" })

        let d1 = await Dye.findById(dye)
        let art1 = await Article.findById(article)
        if (!d1 || !art1)
            return res.status(400).json({ message: "please fill all reqired fields" })

        //@ts-ignore
        if (thickness.size !== size || thickness.article !== article || thickness.dye !== dye)
            if (await SoleThickness.findOne({ dye: dye, article: article, size: size, created_at: { $gte: dt1, $lt: dt2 } })) {
                return res.status(400).json({ message: "sorry !selected dye,article or size not available" })
            }

        await SoleThickness.findByIdAndUpdate(id, {
            dye: d1, article: art1, size: size, left_thickness: left_thickness, right_thickness: right_thickness,
            updated_at: new Date(),
            updated_by: req.user
        })
        return res.status(200).json(thickness)
    }
    public async DeleteSoleThickness(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id
        let thickness = await SoleThickness.findById(id)
        if (!thickness)
            return res.status(404).json({ message: " not found" })
        await thickness.remove()
        return res.status(200).json(thickness)
    }


    public async GetMyTodaySpareDye(req: Request, res: Response, next: NextFunction) {
        let dt1 = new Date()
        dt1.setDate(new Date().getDate())
        dt1.setHours(0)
        dt1.setMinutes(0)
        let sparedyes: ISpareDye[] = []
        let result: GetSpareDyeDto[] = []
        let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []
        if (user_ids.length > 0) {
            sparedyes = await SpareDye.find({ created_at: { $gte: dt1 }, created_by: { $in: user_ids } }).populate('dye').populate('location').populate('created_by').populate('updated_by').sort('-created_at')
        }
        else {
            sparedyes = await SpareDye.find({ created_at: { $gte: dt1 }, created_by: req.user?._id }).populate('dye').populate('location').populate('created_by').populate('updated_by').sort('-created_at')
        }
        result = sparedyes.map((dye) => {
            return {
                _id: dye._id,
                dye: { id: dye._id, value: String(dye.dye.dye_number), label: String(dye.dye.dye_number) },
                repair_required: dye.repair_required,
                is_validated: dye.is_validated,
                dye_photo: dye.dye_photo?.public_url || "",
                photo_time: dye.created_at && moment(dye.photo_time).format("LT"),
                remarks: dye.remarks || "",
                location: { id: dye.location._id, value: dye.location.name, label: dye.location.name },
                created_at: dye.created_at && moment(dye.created_at).format('LT'),
                updated_at: dye.updated_at && moment(dye.updated_at).format('LT'),
                created_by: { id: dye.created_by._id, value: dye.created_by.username, label: dye.created_by.username },
                updated_by: { id: dye.updated_by._id, value: dye.updated_by.username, label: dye.updated_by.username }
            }
        })
        return res.status(200).json(result)
    }

    public async GetSpareDyes(req: Request, res: Response, next: NextFunction) {
        let limit = Number(req.query.limit)
        let page = Number(req.query.page)
        let id = req.query.id
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let dyes: ISpareDye[] = []
        let result: GetSpareDyeDto[] = []
        let count = 0
        let dt1 = new Date(String(start_date))
        dt1.setHours(0)
        dt1.setMinutes(0)
        let dt2 = new Date(String(end_date))
        dt2.setHours(0)
        dt2.setMinutes(0)
        let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []

        if (!Number.isNaN(limit) && !Number.isNaN(page)) {
            if (!id) {
                if (user_ids.length > 0) {
                    dyes = await SpareDye.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: user_ids } }).populate('dye').populate('created_by').populate('location').populate('updated_by').sort('-created_at').skip((page - 1) * limit).limit(limit)
                    count = await SpareDye.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: user_ids } }).countDocuments()
                }

                else {
                    dyes = await SpareDye.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).populate('dye').populate('created_by').populate('location').populate('updated_by').sort('-created_at').skip((page - 1) * limit).limit(limit)
                    count = await SpareDye.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).countDocuments()
                }
            }


            if (id) {
                dyes = await SpareDye.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).populate('dye').populate('created_by').populate('location').populate('updated_by').sort('-created_at').skip((page - 1) * limit).limit(limit)
                count = await SpareDye.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).countDocuments()
            }
            result = dyes.map((dye) => {
                return {
                    _id: dye._id,
                    dye: { id: dye.dye._id, value: String(dye.dye.dye_number), label: String(dye.dye.dye_number) },
                    repair_required: dye.repair_required,
                    dye_photo: dye.dye_photo?.public_url || "",
                    remarks: dye.remarks || "",
                    is_validated: dye.is_validated,
                    photo_time: dye.created_at && moment(dye.photo_time).format("LT"),
                    location: { id: dye.location._id, value: dye.location.name, label: dye.location.name },
                    created_at: dye.created_at && moment(dye.created_at).format("DD/MM/YYYY"),
                    updated_at: dye.updated_at && moment(dye.updated_at).format("DD/MM/YYYY"),
                    created_by: { id: dye.created_by._id, value: dye.created_by.username, label: dye.created_by.username },
                    updated_by: { id: dye.updated_by._id, value: dye.updated_by.username, label: dye.updated_by.username }
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
            return res.status(200).json({ message: "bad request" })
    }


    public async CreateSpareDye(req: Request, res: Response, next: NextFunction) {
        let body = JSON.parse(req.body.body) as CreateOrEditSpareDyeDto
        let { dye, location, repair_required, remarks } = body

        if (!location || !dye || !remarks)
            if (!dye || !location)
                return res.status(400).json({ message: "please fill all reqired fields" })

        let l1 = await DyeLocation.findById(location)
        let d1 = await Dye.findById(dye)
        if (!d1) {
            return res.status(404).json({ message: "dye not found" })
        }
        if (!l1) {
            return res.status(404).json({ message: "location not found" })
        }
        let dyeObj = new SpareDye({
            dye: d1, location: l1
        })

        let dt1 = new Date()
        let dt2 = new Date()
        dt2.setDate(new Date(dt2).getDate() + 1)
        dt1.setHours(0)
        dt1.setMinutes(0)
        if (await ShoeWeight.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } }))
            return res.status(400).json({ message: "sorry ! this dye is in machine" })
        if (await SpareDye.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
            return res.status(400).json({ message: "sorry ! dye is not available" })
        }


        if (req.file) {
            console.log(req.file.mimetype)
            const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
            const storageLocation = `dyestatus/media`;
            if (!allowedFiles.includes(req.file.mimetype))
                return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
            if (req.file.size > 20 * 1024 * 1024)
                return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
            const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
            if (doc)
                dyeObj.dye_photo = doc
            else {
                return res.status(500).json({ message: "file uploading error" })
            }
        }
        dyeObj.created_at = new Date()
        dyeObj.updated_at = new Date()
        if (remarks)
            dyeObj.remarks = remarks;
        if (req.user)
            dyeObj.created_by = req.user
        dyeObj.repair_required = repair_required;
        if (req.user)
            dyeObj.updated_by = req.user
        dyeObj.photo_time = new Date()
        await dyeObj.save()
        return res.status(201).json(dyeObj)
    }

    public async UpdateSpareDye(req: Request, res: Response, next: NextFunction) {
        let body = JSON.parse(req.body.body) as CreateOrEditSpareDyeDto
        let { dye, location, repair_required, remarks } = body
        const id = req.params.id
        let dyeObj = await SpareDye.findById(id)
        if (!dyeObj)
            return res.status(404).json({ message: "dye not found" })
        if (!location || !dye || !remarks)
            if (!dye || !location)
                return res.status(400).json({ message: "please fill all reqired fields" })

        let dt1 = new Date()
        let dt2 = new Date()
        dt2.setDate(new Date(dt2).getDate() + 1)
        dt1.setHours(0)
        dt1.setMinutes(0)

        if (await ShoeWeight.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } }))
            return res.status(400).json({ message: "sorry ! this dye is in machine" })

        if (dyeObj.dye._id.valueOf() !== dye)
            if (await SpareDye.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
                return res.status(400).json({ message: "sorry ! dye is not available" })
            }

        let l1 = await DyeLocation.findById(location)
        let d1 = await Dye.findById(dye)
        if (!d1) {
            return res.status(404).json({ message: "dye not found" })
        }
        if (!l1) {
            return res.status(404).json({ message: "location not found" })
        }
        dyeObj.remarks = remarks;
        dyeObj.dye = d1;
        dyeObj.location = l1;
        if (req.file) {
            console.log(req.file.mimetype)
            const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
            const storageLocation = `dyestatus/media`;
            if (!allowedFiles.includes(req.file.mimetype))
                return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
            if (req.file.size > 20 * 1024 * 1024)
                return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
            const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
            if (doc)
                dyeObj.dye_photo = doc
            else {
                return res.status(500).json({ message: "file uploading error" })
            }
        }
        dyeObj.created_at = new Date()
        dyeObj.updated_at = new Date()
        if (req.user)
            dyeObj.created_by = req.user
        dyeObj.repair_required = repair_required;
        if (req.user)
            dyeObj.updated_by = req.user
        dyeObj.photo_time = new Date()
        await dyeObj.save()
        return res.status(201).json(dyeObj)
    }
    public async DeleteSpareDye(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id
        let dye = await SpareDye.findById(id)
        if (!dye)
            return res.status(404).json({ message: "spare dye not found" })
        dye.updated_at = new Date()
        if (req.user)
            dye.updated_by = req.user
        if (dye.dye_photo && dye.dye_photo._id)
            await destroyCloudFile(dye.dye_photo._id)
        await dye.remove()
        return res.status(200).json(dye)
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



    public async GetDyeStatusReport(req: Request, res: Response, next: NextFunction) {
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let reports: GetDyeStatusReportDto[] = [];

        let dt1 = new Date(String(start_date))
        dt1.setHours(0)
        dt1.setMinutes(0)
        let dt2 = new Date(String(end_date))
        dt2.setHours(0)
        dt2.setMinutes(0)

        let sparedyes = await SpareDye.find({ created_at: { $gte: dt1, $lt: dt2 } }).populate('dye').populate('created_by').populate('location').sort('-created_at')

        let weights = await ShoeWeight.find({ created_at: { $gte: dt1, $lt: dt2 } }).populate('dye').populate('machine').populate('article').populate('created_by').populate('updated_by').sort("-created_at")

        for (let i = 0; i < sparedyes.length; i++) {
            let dye = sparedyes[i];
            if (dye) {
                reports.push({
                    _id: dye._id,
                    dye: dye.dye.dye_number,
                    article: "",
                    size: dye.dye.size,
                    std_weight: dye.dye.stdshoe_weight,
                    location: dye.location.name,
                    repair_required: dye.repair_required ? "Need repair" : "no Need",
                    remarks: dye.remarks,
                    created_at: dye.created_at && moment(dye.created_at).format("DD/MM/YYYY"),
                    created_by: { id: dye.created_by._id, label: dye.created_by.username }
                })
            }
        }
        for (let i = 0; i < weights.length; i++) {
            let dye = weights[i];
            if (dye) {
                reports.push({
                    _id: dye._id,
                    dye: dye.dye.dye_number,
                    article: dye.article.name || "",
                    size: dye.dye.size,
                    std_weight: dye.dye.stdshoe_weight,
                    location: dye.machine.name || "",
                    repair_required: "",
                    remarks: "",
                    created_at: dye.created_at && moment(dye.created_at).format("DD/MM/YYYY"),
                    created_by: { id: dye.created_by._id, label: dye.created_by.username }
                })
            }
        }

        return res.status(200).json(reports)
    }
    public async GetNewRefers(req: Request, res: Response, next: NextFunction) {
        let result: GetReferDto[] = [];
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let dt1 = new Date(String(start_date))
        let dt2 = new Date(String(end_date))
        let parties: IReferredParty[] = []

        parties = await ReferredParty.find({ created_at: { $gte: dt1, $lt: dt2 }, convertedfromlead: true }).populate('created_by').populate('updated_by').sort('-created_at');

        result = parties.map((r) => {
            return {
                _id: r._id,
                name: r.name,
                refers: r.refers,
                last_remark: r.last_remark || "",
                customer_name: r.customer_name,
                mobile: r.mobile,
                mobile2: r.mobile2,
                mobile3: r.mobile3,
                uploaded_bills: r.uploaded_bills,
                address: r.address,
                gst: r.gst,
                city: r.city,
                state: r.state,
                convertedfromlead: r.convertedfromlead,
                created_at: moment(r.created_at).format("DD/MM/YYYY"),
                updated_at: moment(r.updated_at).format("DD/MM/YYYY"),
                created_by: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username },
                updated_by: { id: r.updated_by._id, value: r.updated_by.username, label: r.updated_by.username },
            }
        })
        return res.status(200).json(result)
    }

    public async GetAssignedRefers(req: Request, res: Response, next: NextFunction) {
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let dt1 = new Date(String(start_date))
        let dt2 = new Date(String(end_date))
        let result: GetLeadDto[] = []
        let leads: ILead[] = []

        leads = await Lead.find({ referred_date: { $gte: dt1, $lt: dt2 } }).populate('created_by').populate('updated_by').populate('referred_party').sort('-referred_date')
        result = leads.map((lead) => {
            return {
                _id: lead._id,
                name: lead.name,
                customer_name: lead.customer_name,
                customer_designation: lead.customer_designation,
                mobile: lead.mobile,
                gst: lead.gst,
                uploaded_bills: lead.uploaded_bills,
                has_card: lead.has_card,
                email: lead.email,
                city: lead.city,
                state: lead.state,
                country: lead.country,
                address: lead.address,
                work_description: lead.work_description,
                turnover: lead.turnover,
                alternate_mobile1: lead.alternate_mobile1,
                alternate_mobile2: lead.alternate_mobile2,
                alternate_email: lead.alternate_email,
                lead_type: lead.lead_type,
                stage: lead.stage,
                lead_source: lead.lead_source,
                visiting_card: lead.visiting_card?.public_url || "",
                referred_party_name: lead.referred_party && lead.referred_party.name,
                referred_party_mobile: lead.referred_party && lead.referred_party.mobile,
                referred_date: lead.referred_party && moment(lead.referred_date).format("DD/MM/YYYY"),
                last_remark: lead.last_remark || "",
                created_at: moment(lead.created_at).format("DD/MM/YYYY"),
                updated_at: moment(lead.updated_at).format("DD/MM/YYYY"),
                created_by: { id: lead.created_by._id, value: lead.created_by.username, label: lead.created_by.username },
                updated_by: { id: lead.updated_by._id, value: lead.updated_by.username, label: lead.updated_by.username },
            }
        })
        return res.status(200).json(result)
    }

    public async GetMyReminders(req: Request, res: Response, next: NextFunction) {
        let previous_date = new Date()
        let day = previous_date.getDate() - 100
        previous_date.setDate(day)
        let remarks = await Remark.find({ created_at: { $gte: previous_date, $lte: new Date() } }).populate('created_by').populate('updated_by').populate({
            path: 'lead',
            populate: [
                {
                    path: 'created_by',
                    model: 'User'
                },
                {
                    path: 'updated_by',
                    model: 'User'
                },
                {
                    path: 'referred_party',
                    model: 'ReferredParty'
                }
            ]
        }).sort('-created_at')
        let result: GetActivitiesOrRemindersDto[] = []
        let ids: string[] = []
        let filteredRemarks: IRemark[] = []

        for (let i = 0; i < remarks.length; i++) {
            let rem = remarks[i]
            if (rem && rem.lead && !ids.includes(rem.lead._id)) {
                ids.push(rem.lead._id);
                if (rem.created_by._id.valueOf() == req.user?._id && rem.remind_date && rem.remind_date >= hundredDaysAgo && rem.remind_date < new Date())
                    filteredRemarks.push(rem);
            }
        }
        filteredRemarks.sort(function (a, b) {
            //@ts-ignore
            return new Date(b.remind_date) - new Date(a.remind_date);
        });

        result = filteredRemarks.map((rem) => {
            return {
                _id: rem._id,
                remark: rem.remark,
                created_at: rem.created_at && moment(rem.created_at).format("DD/MM/YYYY"),
                remind_date: rem.remind_date && moment(rem.remind_date).format("DD/MM/YYYY"),
                created_by: { id: rem.created_by._id, value: rem.created_by.username, label: rem.created_by.username },
                lead_id: rem.lead && rem.lead._id,
                name: rem.lead && rem.lead.name,
                customer_name: rem.lead && rem.lead.customer_name,
                customer_designation: rem.lead && rem.lead.customer_designation,
                mobile: rem.lead && rem.lead.mobile,
                gst: rem.lead && rem.lead.gst,
                has_card: rem.lead && rem.lead.has_card,
                email: rem.lead && rem.lead.email,
                city: rem.lead && rem.lead.city,
                state: rem.lead && rem.lead.state,
                country: rem.lead && rem.lead.country,
                address: rem.lead && rem.lead.address,
                work_description: rem.lead && rem.lead.work_description,
                turnover: rem.lead && rem.lead.turnover,
                alternate_mobile1: rem.lead && rem.lead.alternate_mobile1,
                alternate_mobile2: rem.lead && rem.lead.alternate_mobile2,
                alternate_email: rem.lead && rem.lead.alternate_email,
                lead_type: rem.lead && rem.lead.lead_type,
                stage: rem.lead && rem.lead.stage,
                lead_source: rem.lead && rem.lead.lead_source,
                visiting_card: rem.lead && rem.lead.visiting_card?.public_url || "",
                referred_party_name: rem.lead && rem.lead.referred_party?.name || "",
                referred_party_mobile: rem.lead && rem.lead.referred_party?.mobile || "",
                referred_date: rem.lead && rem.lead.referred_date && moment(rem.lead && rem.lead.referred_date).format("DD/MM/YYYY") || "",
            }
        })


        return res.status(200).json(result)
    }


    public async GetThekedarWiseProductionReports(req: Request, res: Response, next: NextFunction) {
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let production: IColumnRowData = {
            columns: [],
            rows: []
        };
        let dt1 = new Date(String(start_date))
        dt1.setHours(0)
        dt1.setMinutes(0)
        let dt2 = new Date(String(end_date))
        dt2.setHours(0)
        dt2.setMinutes(0)
        const oneDay = 24 * 60 * 60 * 1000;
        let users = await User.find().sort("username")
        //columns
        production.columns.push({ key: 'date', header: 'Date', type: 'date' });
        users = users.filter((u) => { return u.assigned_permissions.includes('production_view') })
        for (let k = 0; k < users.length; k++) {
            let user = users[k]
            production.columns.push({ key: user.username, header: String(user.username).toUpperCase(), type: 'number' })
        }
        production.columns.push({ key: 'total', header: 'Total', type: 'number' });
        while (dt1 <= dt2) {
            //rows
            let total = 0
            let obj: IRowData = {}
            obj['date'] = moment(dt1).format("DD/MM/YYYY")
            for (let k = 0; k < users.length; k++) {
                let user = users[k]
                let data = await Production.find({ date: { $gte: dt1, $lt: new Date(dt1.getTime() + oneDay) }, thekedar: user._id })
                let result = data.reduce((a, b) => { return Number(a) + Number(b.production) }, 0)
                if (result === 0)
                    obj[users[k].username] = result;
                else
                    obj[users[k].username] = result;
                total += result
            }
            obj['total'] = total
            production.rows.push(obj);
            dt1 = new Date(dt1.getTime() + oneDay);
        }


        return res.status(200).json(production)
    }

    public async GetMachineWiseProductionReports(req: Request, res: Response, next: NextFunction) {
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let production: IColumnRowData = {
            columns: [],
            rows: []
        };
        let dt1 = new Date(String(start_date))
        dt1.setHours(0)
        dt1.setMinutes(0)
        let dt2 = new Date(String(end_date))
        dt2.setHours(0)
        dt2.setMinutes(0)
        const oneDay = 24 * 60 * 60 * 1000;
        let machines = await Machine.find({ active: true }).sort('serial_no')
        //columns
        production.columns.push({ key: 'date', header: 'Date', type: 'date' });
        for (let k = 0; k < machines.length; k++) {
            production.columns.push({ key: machines[k].name, header: String(machines[k].display_name).toUpperCase(), type: 'number' })
        }
        production.columns.push({ key: 'total', header: 'Total', type: 'number' });

        //rows
        while (dt1 <= dt2) {
            let total = 0
            let obj: IRowData = {}
            obj['date'] = moment(dt1).format("DD/MM/YYYY")
            for (let k = 0; k < machines.length; k++) {
                let data = await Production.find({ date: { $gte: dt1, $lt: new Date(dt1.getTime() + oneDay) }, machine: machines[k]._id })
                let result = data.reduce((a, b) => { return Number(a) + Number(b.production) }, 0)
                if (result === 0)
                    obj[machines[k].name] = result;
                else
                    obj[machines[k].name] = result;
                total += result
            }
            obj['total'] = total
            production.rows.push(obj);
            dt1 = new Date(dt1.getTime() + oneDay);
        }

        return res.status(200).json(production)
    }


    public async GetCategoryWiseProductionReports(req: Request, res: Response, next: NextFunction) {
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let productions: GetCategoryWiseProductionReportDto[] = [];
        let dt1 = new Date(String(start_date))
        dt1.setHours(0)
        dt1.setMinutes(0)
        let dt2 = new Date(String(end_date))
        dt2.setHours(0)
        dt2.setMinutes(0)
        const oneDay = 24 * 60 * 60 * 1000;

        while (dt1 <= dt2) {

            let data = await Production.find({ date: { $gte: dt1, $lt: new Date(dt1.getTime() + oneDay) } }).populate('machine')

            let verpluslymphaprod = data.filter((prod) => { return prod.machine.category === "vertical" || prod.machine.category === "lympha" }).reduce((a, b) => { return Number(a) + Number(b.production) }, 0)

            let puprod = data.filter((prod) => { return prod.machine.category === "pu" }).reduce((a, b) => { return Number(a) + Number(b.production) }, 0)
            let gumbootprod = data.filter((prod) => { return prod.machine.category === "gumboot" }).reduce((a, b) => { return Number(a) + Number(b.production) }, 0)
            let total = verpluslymphaprod + puprod + gumbootprod;
            productions.push({
                date: moment(dt1).format("DD/MM/YYYY"),
                total: total,
                verticalpluslympha: verpluslymphaprod,
                pu: puprod,
                gumboot: gumbootprod
            })
            dt1 = new Date(dt1.getTime() + oneDay);
        }
        return res.status(200).json(productions)
    }

    public async GetShoeWeightDifferenceReports(req: Request, res: Response, next: NextFunction) {
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let weights: IShoeWeight[] = []
        let reports: GetShoeWeightDiffReportDto[] = []
        let dt1 = new Date(String(start_date))
        dt1.setHours(0)
        dt1.setMinutes(0)
        let dt2 = new Date(String(end_date))
        dt2.setHours(0)
        dt2.setMinutes(0)
        weights = await ShoeWeight.find({ created_at: { $gte: dt1, $lt: dt2 } }).populate('dye').populate('machine').populate('article').populate('created_by').populate('updated_by').sort("dye.dye_number")
        reports = weights.map((weight) => {
            return {
                date: moment(weight.created_at).format("DD/MM/YYYY"),
                dye_no: weight.dye.dye_number,
                article: weight.article.display_name,
                size: weight.dye.size,
                st_weight: weight.dye.stdshoe_weight || 0,
                machine: weight.machine.display_name,
                w1: weight.shoe_weight1 || 0,
                w2: weight.shoe_weight2 || 0,
                w3: weight.shoe_weight3 || 0,
                u1: weight.upper_weight1 || 0,
                u2: weight.upper_weight2 || 0,
                u3: weight.upper_weight3 || 0,
                d1: weight.shoe_weight1 && weight.upper_weight1 ? (weight.shoe_weight1 - weight.upper_weight1 - weight.dye.stdshoe_weight) : 0,
                d2: weight.shoe_weight2 && weight.upper_weight2 ? (weight.shoe_weight2 - weight.upper_weight2 - weight.dye.stdshoe_weight) : 0,
                d3: weight.shoe_weight3 && weight.upper_weight3 ? (weight.shoe_weight3 - weight.upper_weight3 - weight.dye.stdshoe_weight) : 0,
                person: weight.created_by.username
            }
        })
        return res.status(200).json(reports)
    }


}