import { NextFunction, Request, Response } from 'express';

import isMongoId from 'validator/lib/isMongoId';
import moment from 'moment';
import { CreateOrEditBillDto, GetBillDto } from '../dtos/crm-bill.dto';
import { BillItem } from '../models/bill-item.model';
import { Bill, IBill } from '../models/crm-bill.model';
import Lead from '../models/lead.model';
import { ReferredParty } from '../models/refer.model';
import { Asset } from '../models/user.model';
import { destroyCloudFile } from '../services/destroyCloudFile';
import { uploadFileToCloud } from '../services/uploadFileToCloud';

export const CreateBill = async (req: Request, res: Response, next: NextFunction) => {
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

export const UpdateBill = async (req: Request, res: Response, next: NextFunction) => {
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
export const DeleteBill = async (req: Request, res: Response, next: NextFunction) => {
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

export const GetReferPartyBillsHistory = async (req: Request, res: Response, next: NextFunction) => {
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
            refer: { id: refer && refer._id, value: refer && refer.name, label: refer && refer.name },
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
            created_by: { id: bill.created_by._id, value: bill.created_by.username, label: bill.created_by.username },
            updated_by: { id: bill.updated_by._id, value: bill.updated_by.username, label: bill.updated_by.username }
        })
    }
    return res.json(result)
}

export const GetLeadPartyBillsHistory = async (req: Request, res: Response, next: NextFunction) => {
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
            lead: { id: lead && lead._id, value: lead && lead.name, label: lead && lead.name },
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
            created_by: { id: bill.created_by._id, value: bill.created_by.username, label: bill.created_by.username },
            updated_by: { id: bill.updated_by._id, value: bill.updated_by.username, label: bill.updated_by.username }
        })
    }
    return res.json(result)
}