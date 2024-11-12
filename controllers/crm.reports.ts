import { NextFunction, Request, Response } from 'express';
import { GetActivitiesOrRemindersDto, GetLeadDto, GetReferDto } from '../dtos';
import { IReferredParty, ReferredParty } from '../models/refer';
import moment from 'moment';
import Lead, { ILead } from '../models/lead';
import { IRemark, Remark } from '../models/crm-remarks';
import { hundredDaysAgo, today, tomorrow } from '../utils/datesHelper';

export const GetNewRefers = async (req: Request, res: Response, next: NextFunction) => {
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

export const GetAssignedRefers = async (req: Request, res: Response, next: NextFunction) => {
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

export const GetMyReminders = async (req: Request, res: Response, next: NextFunction) => {
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

    for(let i=0;i<remarks.length;i++){
        let rem=remarks[i]
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