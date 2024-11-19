import { Types } from "mongoose";
import { IReferredParty, ReferredParty } from "../models/refer";
import { NextFunction, Request, Response } from 'express';
import { CreateOrEditMergeRefersDto, CreateOrEditReferDto,  GetReferDto, GetReferFromExcelDto } from "../dtos";
import Lead from "../models/lead";
import { Remark } from "../models/crm-remarks";
import { Bill } from "../models/crm-bill";
import { User } from "../models/user";
import moment from "moment";
import isMongoId from "validator/lib/isMongoId";
import xlsx from "xlsx"

export const MergeTwoRefers = async (req: Request, res: Response, next: NextFunction) => {
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

export const GetRefers = async (req: Request, res: Response, next: NextFunction) => {
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


export const GetPaginatedRefers = async (req: Request, res: Response, next: NextFunction) => {
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


export const FuzzySearchRefers = async (req: Request, res: Response, next: NextFunction) => {
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


export const CreateReferParty = async (req: Request, res: Response, next: NextFunction) => {
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

export const UpdateReferParty = async (req: Request, res: Response, next: NextFunction) => {
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


export const DeleteReferParty = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    if (!isMongoId(id))
        return res.status(400).json({ message: "bad mongo id" })
    let party = await ReferredParty.findById(id)
    if (!party)
        return res.status(404).json({ message: "party not found" })
    await ReferredParty.findByIdAndDelete(id)
    return res.status(200).json({ message: "deleted" })
}



export const BulkReferUpdateFromExcel = async (req: Request, res: Response, next: NextFunction) => {
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