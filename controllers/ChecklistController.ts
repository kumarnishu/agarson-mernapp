import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import isMongoId from "validator/lib/isMongoId";
import moment from "moment";
import ConvertJsonToExcel from "../services/ConvertJsonToExcel";
import { areDatesEqual, previousYear, nextYear, getFirstMonday, currentMonth, previousMonth, nextMonth } from "../utils/datesHelper";

import { getChecklistScore } from "../utils/getChecklistScore";
import { CreateChecklistFromExcelDto, GetChecklistTopBarDto, GetChecklistDto, GroupedChecklistDto, CreateOrEditChecklistDto, CreateOrEditChecklistRemarkDto, GetChecklistRemarksDto } from "../dtos/ChecklistDto";
import { IChecklistBox, IChecklist, IChecklistRemark } from "../interfaces/ChecklistInterface";
import { IUser, Asset } from "../interfaces/UserController";
import { Checklist, ChecklistBox, ChecklistRemark } from "../models/ChecklistModel";
import { ChecklistCategory } from "../models/DropDownModel";
import { User } from "../models/UserModel";
import { destroyCloudFile } from "../services/destroyCloudFile";
import { uploadFileToCloud } from "../services/uploadFileToCloud";

export class ChecklistController {

    public async CreateChecklistFromExcel(req: Request, res: Response, next: NextFunction) {
        let result: CreateChecklistFromExcelDto[] = []
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
            let workbook_response: CreateChecklistFromExcelDto[] = xlsx.utils.sheet_to_json(
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
    public async GetChecklistTopBarDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const emp = req.query.emp;


            // Aggregate category counts
            const categoryCounts = await Checklist.aggregate([
                {
                    $group: {
                        _id: "$category",
                        count: { $sum: 1 }
                    }
                }
            ]);

            const categories = await ChecklistCategory.find().sort('category');
            let categorydata = categories.map(cat => {
                const found = categoryCounts.find(c => c._id?.toString() === cat._id.toString());
                return { category: cat.category, count: found ? found.count : 0 };
            });

            const total = categoryCounts.reduce((sum, cat) => sum + cat.count, 0);
            categorydata.unshift({ category: 'total', count: total });

            let checklistFilter: any = {};
            if (emp !== 'all') {
                checklistFilter.assigned_users = emp;
            }

            const checklists = await Checklist.find(checklistFilter).select('_id');
            const checklistIds = checklists.map(ch => ch._id);

            const [boxes, boxes2] = await Promise.all([
                ChecklistBox.find({ checklist: { $in: checklistIds }, date: { $gte: currentMonth, $lte: nextMonth } }),
                ChecklistBox.find({ checklist: { $in: checklistIds }, date: { $gte: previousMonth, $lte: currentMonth } })
            ]);

            const result: GetChecklistTopBarDto = {
                categorydData: categorydata,
                lastmonthscore: getChecklistScore(boxes2),
                currentmonthscore: getChecklistScore(boxes)
            };

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
    public async GetChecklists(req: Request, res: Response, next: NextFunction) {
        let stage = req.query.stage
        let id = req.query.id
        let checklists: IChecklist[] = []
        let result: GetChecklistDto[] = []

        let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []
        if (req.user?.assigned_users && req.user?.assigned_users.length > 0 && id == 'all') {
            {
                checklists = await Checklist.find({ assigned_users: { $in: user_ids } }).populate('created_by').populate('updated_by').populate('category').populate('assigned_users').populate('lastcheckedbox').populate('last_10_boxes').sort("serial_no")
            }
        }
        else if (id == 'all') {
            checklists = await Checklist.find({ assigned_users: req.user?._id }).populate('created_by').populate('updated_by').populate('category').populate('lastcheckedbox').populate('last_10_boxes').populate('assigned_users').sort("serial_no")

        }

        else {
            checklists = await Checklist.find({ assigned_users: id }).populate('created_by').populate('updated_by').populate('category').populate('assigned_users').populate('lastcheckedbox').populate('last_10_boxes').sort("serial_no")
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
                today_score: ch.lastcheckedbox && ch.lastcheckedbox.score || 0,
                filtered_score: getChecklistScore(ch.last_10_boxes),
                work_title: ch.work_title,
                group_title: ch.group_title,
                condition: ch.condition,
                expected_number: ch.expected_number,
                link: ch.link,
                last_checked_box: ch.lastcheckedbox && {
                    _id: ch.lastcheckedbox._id,
                    stage: ch.lastcheckedbox.stage,
                    score: ch.lastcheckedbox.score,
                    last_remark: ch.lastcheckedbox.last_remark,
                    checklist: { id: ch._id, label: ch.work_title, value: ch.work_title },
                    date: ch.lastcheckedbox.date.toString()
                },
                last_10_boxes: ch.last_10_boxes && ch.last_10_boxes.map((bo) => {
                    return {
                        _id: bo._id,
                        stage: bo.stage,
                        score: bo.score,
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


        return res.status(200).json(result)
    }
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
                $sort: { serial_no: 1 } // Optional: Sort groups alphabetically by work_title
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
                        today_score: ch.lastcheckedbox && ch.lastcheckedbox.score || 0,
                        filtered_score: getChecklistScore(ch.last_10_boxes),
                        group_title: ch.group_title,
                        link: ch.link,
                        condition: ch.condition,
                        expected_number: ch.expected_number,
                        last_checked_box: ch.lastcheckedbox && {
                            _id: ch.lastcheckedbox._id,
                            stage: ch.lastcheckedbox.stage,
                            score: ch.lastcheckedbox.score,
                            last_remark: ch.lastcheckedbox.last_remark,
                            checklist: { id: ch._id, label: ch.work_title, value: ch.work_title },
                            date: new Date(ch.lastcheckedbox.date).toString()
                        },//@ts-ignore
                        boxes: ch.last_10_boxes && ch.last_10_boxes.sort((a, b) => new Date(a.date) - new Date(b.date)).map((bo) => {
                            return {
                                _id: bo._id,
                                stage: bo.stage,
                                score: bo.score,
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
                                score: bo.score,
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

        if (req.user?.is_admin && id == 'all') {
            {

                checklists = await Checklist.find().populate('created_by').populate('lastcheckedbox').populate('updated_by').populate('category').populate('assigned_users').populate('last_10_boxes').sort("serial_no")

                count = await Checklist.find().countDocuments()
            }
        }
        else if (id == 'all') {
            checklists = await Checklist.find({ assigned_users: req.user?._id }).populate('created_by').populate('lastcheckedbox').populate('updated_by').populate('category').populate('last_10_boxes').populate('assigned_users').sort("serial_no")
            count = await Checklist.find({ user: req.user?._id }).countDocuments()
        }

        else {
            checklists = await Checklist.find({ assigned_users: id }).populate('created_by').populate('lastcheckedbox').populate('updated_by').populate('category').populate('last_10_boxes').populate('assigned_users')
                .populate({
                    path: 'checklist_boxes',
                    match: { date: { $gte: previousYear, $lte: nextYear } }, // Filter by date range
                }).sort("serial_no")

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
                serial_no: ch.serial_no,
                last_remark: ch.last_remark,
                today_score: ch.lastcheckedbox && ch.lastcheckedbox.score || 0,
                filtered_score: id == 'all' ? getChecklistScore(ch.last_10_boxes) : getChecklistScore(ch.checklist_boxes.filter((b) => {
                    return b.date >= dt1 && b.date < dt2
                })),
                condition: ch.condition,
                expected_number: ch.expected_number,
                group_title: ch.group_title,
                link: ch.link,
                last_checked_box: ch.lastcheckedbox && {
                    _id: ch.lastcheckedbox._id,
                    stage: ch.lastcheckedbox.stage,
                    score: ch.lastcheckedbox.score,
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
                        score: bo.score,
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
                        score: bo.score,
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
        return res.status(200).json(result)
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
            frequency,
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
            frequency: frequency,
            condition,
            expected_number,
            link: link,
            assigned_users: assigned_users,
            updated_at: new Date(),
            updated_by: req.user,
            photo: document
        })
        let checklistboxes: IChecklistBox[] = [];
        let last10boxes: IChecklistBox[] = []
        let dt1 = new Date()
        dt1.setHours(0, 0, 0, 0)
        let dt2 = new Date()

        dt2.setDate(dt1.getDate() + 1)
        dt2.setHours(0)
        dt2.setMinutes(0)
        let end_date = new Date();
        end_date.setFullYear(end_date.getFullYear() + 30)
        let limit = 0
        if (frequency == 'daily')
            limit = 5
        if (frequency == 'monthly')
            limit = 2
        if (frequency == 'weekly')
            limit = 3
        if (frequency == 'yearly')
            limit = 2
        const ch = await Checklist.findById(checklist._id)
        if (frequency !== checklist.frequency) {
            await ChecklistBox.deleteMany({ checklist: checklist._id })
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

            if (ch) {
                console.log(last10boxes.length)
                ch.last_10_boxes = last10boxes
                ch.checklist_boxes = checklistboxes
                await ch.save();
            }
        }
        console.log(frequency)

        last10boxes = await ChecklistBox.find({ checklist: checklist, date: { $lt: dt2 } }).sort("-date").limit(limit)
        if (ch) {
            //@ts-ignore
            last10boxes.sort((a, b) => new Date(a.date) - new Date(b.date));
            ch.last_10_boxes = last10boxes
            await ch?.save()
        }
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
    public async UpdateChecklistRemark(req: Request, res: Response, next: NextFunction) {
        const { remark, checklist } = req.body as CreateOrEditChecklistRemarkDto
        if (!remark) return res.status(403).json({ message: "please fill required fields" })

        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
        let rremark = await ChecklistRemark.findById(id)
        if (!rremark) {
            return res.status(404).json({ message: "remark not found" })
        }
        rremark.remark = remark
        await rremark.save()
        await Checklist.findByIdAndUpdate(checklist, { last_remark: remark })
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

    public async NewChecklistRemarkFromAdmin(req: Request, res: Response, next: NextFunction) {
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
        await new_remark.save()
        await box.save()
        await Checklist.findByIdAndUpdate(checklist, { last_remark: remark })
        return res.status(200).json({ message: "remark added successfully" })
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
    public async DownloadExcelTemplateForCreatechecklists(req: Request, res: Response, next: NextFunction) {
        let checklists: CreateChecklistFromExcelDto[] = [{
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
        const { ids } = req.body as { ids: string[] };
    
        // Fetch all checklists and associated checklist boxes in parallel
        const checklists = await Checklist.find({ _id: { $in: ids } }).exec();
        if (!checklists || checklists.length === 0) {
            return res.status(404).json({ message: "Checklists not found" });
        }
    
        // Collect all checklist boxes to delete in bulk
        const checklistBoxIds = await ChecklistBox.find({ checklist: { $in: checklists.map(c => c._id) } }).exec();
        const checklistBoxIdsToDelete = checklistBoxIds.map(box => box._id);
    
        // Collect all checklist remarks to delete in bulk
        await ChecklistRemark.deleteMany({ checklist_box: { $in: checklistBoxIdsToDelete } });
    
        // Delete checklist boxes and photos in parallel
        const deleteChecklistPromises = checklists.map(async (checklist) => {
            // Remove photo from cloud storage if it exists
            if (checklist.photo && checklist.photo._id) {
                await destroyCloudFile(checklist.photo._id);
            }
    
            // Delete related checklist boxes and the checklist itself
            await ChecklistBox.deleteMany({ checklist: checklist._id });
            await checklist.remove();
        });
    
        // Wait for all deletions to complete
        await Promise.all(deleteChecklistPromises);
    
        return res.status(200).json({ message: "Checklists are deleted" });
    }
    

    public async FixLast10boxes(req: Request, res: Response, next: NextFunction) {
        let dt1 = new Date()
        dt1.setHours(0, 0, 0, 0)
        let dt2 = new Date()

        dt2.setDate(dt1.getDate() + 1)
        dt2.setHours(0)
        dt2.setMinutes(0)
        let checklists = await Checklist.find({})
        for (let i = 0; i < checklists.length; i++) {
            let ch = checklists[i]
            let boxes: IChecklistBox[] = []
            if (ch.last_10_boxes.length > 5) {
                if (ch.frequency == 'daily')
                    boxes = await ChecklistBox.find({ checklist: checklists[i], date: { $lt: dt2 } }).sort("-date").limit(5)
                if (ch.frequency == 'monthly')
                    boxes = await ChecklistBox.find({ checklist: checklists[i], date: { $lt: dt2 } }).sort("-date").limit(2)
                if (ch.frequency == 'weekly')
                    boxes = await ChecklistBox.find({ checklist: checklists[i], date: { $lt: dt2 } }).sort("-date").limit(3)
                if (ch.frequency == 'yearly')
                    boxes = await ChecklistBox.find({ checklist: checklists[i], date: { $lt: dt2 } }).sort("-date").limit(2)
                //@ts-ignore
                boxes.sort((a, b) => new Date(a.date) - new Date(b.date));
                ch.last_10_boxes = boxes
                await ch.save()
            }
        }
        return res.status(200).json({ message: "success" })

    }
}