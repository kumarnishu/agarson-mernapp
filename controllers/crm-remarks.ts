import { NextFunction, Request, Response } from 'express';
import { CreateOrEditRemarkDto, GetActivitiesOrRemindersDto, GetActivitiesTopBarDetailsDto, GetRemarksDto } from '../dtos';
import isMongoId from 'validator/lib/isMongoId';
import { IRemark, Remark } from '../models/crm-remarks';
import { User } from '../models/user';
import Lead from '../models/lead';
import { ReferredParty } from '../models/refer';
import moment from 'moment';
import { Stage } from '../models/crm-stage';

export const UpdateRemark = async (req: Request, res: Response, next: NextFunction) => {
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

export const DeleteRemark = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "lead id not valid" })
    let rremark = await Remark.findById(id)
    if (!rremark) {
        return res.status(404).json({ message: "remark not found" })
    }
    await rremark.remove()
    return res.status(200).json({ message: " remark deleted successfully" })
}

export const GetReferRemarkHistory = async (req: Request, res: Response, next: NextFunction) => {
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
export const GetRemarkHistory = async (req: Request, res: Response, next: NextFunction) => {
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

export const GetActivitiesTopBarDetails = async (req: Request, res: Response, next: NextFunction) => {
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
    let ids = req.user?.assigned_users.map((id:{_id:string}) => { return id._id })
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
export const GetActivities = async (req: Request, res: Response, next: NextFunction) => {
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
    let ids = req.user?.assigned_users.map((id:{_id:string}) => { return id._id })
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

export const NewRemark = async (req: Request, res: Response, next: NextFunction) => {
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