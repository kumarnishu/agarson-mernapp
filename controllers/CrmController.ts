import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import isMongoId from "validator/lib/isMongoId";
import moment from "moment";
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
import { CreateOrEditBillDto, GetBillDto } from "../dtos/crm-bill.dto";
import { CreateOrEditRemarkDto, GetRemarksDto, GetActivitiesTopBarDetailsDto, GetActivitiesOrRemindersDto } from "../dtos/crm-remarks.dto";
import { CreateOrEditMergeRefersDto, GetReferDto, CreateOrEditReferDto, GetReferFromExcelDto } from "../dtos/refer.dto";
import { BillItem } from "../models/bill-item.model";
import { hundredDaysAgo } from "../utils/datesHelper";
import ConvertJsonToExcel from "../services/ConvertJsonToExcel";


export class CrmController {

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

    public async DownloadExcelTemplateForCreateLeads(req: Request, res: Response, next: NextFunction) {
        let data: GetLeadFromExcelDto[] = [{
            _id: "ere3rer",
            name: "ABC footwear",
            customer_name: 'ABC',
            customer_designation: 'CEO',
            gst: "",
            mobile: "7078789898",
            email: "",
            city: "hisar",
            state: "haryana",
            country: "india",
            address: "",
            work_description: "",
            turnover: "",
            alternate_mobile1: "",
            alternate_mobile2: "",
            alternate_email: "",
            lead_type: "",
            stage: "open",
            lead_source: "internet",
            status: ""
        }]



        let template: { sheet_name: string, data: any[] }[] = []
        template.push({ sheet_name: 'template', data: data })
        ConvertJsonToExcel(template)
        let fileName = "CreateLeadTemplate.xlsx"
        return res.download("./file", fileName)
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
            if (workbook_response.length > 50000) {
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

    public async DownloadExcelTemplateForCreateRefer(req: Request, res: Response, next: NextFunction) {
        let data: GetReferFromExcelDto[] = [{
            _id: "ere3rer",
            name: "ABC footwear",
            customer_name: "ABC",
            mobile: '7878676567',
            mobile2: '',
            mobile3: '',
            address: 'abc street',
            gst: '',
            city: 'hisar',
            state: 'haryana',
            status: ''
        }]

        let template: { sheet_name: string, data: any[] }[] = []
        template.push({ sheet_name: 'template', data: data })
        ConvertJsonToExcel(template)
        let fileName = "CreateReferTemplate.xlsx"
        return res.download("./file", fileName)
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
}