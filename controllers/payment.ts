import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import { AssignOrRemovePaymentDto, CreateOrEditPaymentDto, GetPaymentsFromExcelDto, GetPaymentDto, CreateOrEditChecklistRemarkDto, CreateOrEditPaymentDocumentDto } from "../dtos";
import moment from "moment";
import { Asset, User } from "../models/user";
import { uploadFileToCloud } from "../utils/uploadFileToCloud";
import { destroyCloudFile } from "../utils/destroyCloudFile";
import isMongoId from "validator/lib/isMongoId";
import ConvertJsonToExcel from "../utils/ConvertJsonToExcel";
import { PaymentCategory } from "../models/payment-category";
import { IPayment, Payment } from "../models/payment";
import { PaymentDocument } from "../models/payment-document";
import { isDate } from "util/types";
import { dateToExcelFormat, extractDateFromExcel, parseExcelDate } from "../utils/datesHelper";


export const GetPaymentsTopBarDetails = async (req: Request, res: Response, next: NextFunction) => {
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
export const GetPayments = async (req: Request, res: Response, next: NextFunction) => {
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
export const GetMobilePayments = async (req: Request, res: Response, next: NextFunction) => {
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

export const CreatePayment = async (req: Request, res: Response, next: NextFunction) => {
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
export const EditPayment = async (req: Request, res: Response, next: NextFunction) => {

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

export const CompletePayment = async (req: Request, res: Response, next: NextFunction) => {
    const { remark } = req.body as CreateOrEditPaymentDocumentDto
    let document = new PaymentDocument({ remark: remark })
    await document.save()
    return res.status(200).json({ message: "document uploaded successfully" })
}

export const UpdatePayment = async (req: Request, res: Response, next: NextFunction) => {
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

export const ChangeNextDate = async (req: Request, res: Response, next: NextFunction) => {
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
export const ChangeDueDate = async (req: Request, res: Response, next: NextFunction) => {
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
export const DeletePayment = async (req: Request, res: Response, next: NextFunction) => {
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
export const CreatePaymentFromExcel = async (req: Request, res: Response, next: NextFunction) => {
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
export const DownloadExcelTemplateForCreatePayments = async (req: Request, res: Response, next: NextFunction) => {
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
export const AssignPaymentsToUsers = async (req: Request, res: Response, next: NextFunction) => {
    const { payment_ids, user_ids, flag } = req.body as AssignOrRemovePaymentDto
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
export const BulkDeletePayments = async (req: Request, res: Response, next: NextFunction) => {
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