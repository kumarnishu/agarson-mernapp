import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import { CreateAndUpdatesLeadFromExcelDto, CreateOrEditLeadDto, CreateOrEditMergeLeadsDto, CreateOrRemoveReferForLeadDto, GetLeadDto } from "../dtos";
import Lead, { ILead } from "../models/lead";
import { ReferredParty } from "../models/refer";
import { Remark } from "../models/crm-remarks";
import { Bill } from "../models/crm-bill";
import isMongoId from "validator/lib/isMongoId";
import moment from "moment";
import { Asset, IUser, User } from "../models/user";
import { Stage } from "../models/crm-stage";
import { uploadFileToCloud } from "../utils/uploadFileToCloud";
import { destroyCloudFile } from "../utils/destroyCloudFile";
import { Types } from "mongoose";

export const MergeTwoLeads = async (req: Request, res: Response, next: NextFunction) => {
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
export const GetAssignedReferrals = async (req: Request, res: Response, next: NextFunction) => {
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

export const GetLeads = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let stage = req.query.stage
    let user = await User.findById(req.user).populate('assigned_crm_states').populate('assigned_crm_cities');
    let showonlycardleads = Boolean(user?.show_only_visiting_card_leads)
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
            }).populate('updated_by').populate('referred_party').populate('created_by').sort('-created_at').skip((page - 1) * limit).limit(limit)
            count = await Lead.find({
                stage: stage, state: { $in: states }, city: { $in: cities }
            }).countDocuments()
        }
        else if (showonlycardleads) {
            leads = await Lead.find({
                has_card: showonlycardleads, state: { $in: states }, city: { $in: cities }
            }).populate('updated_by').populate('referred_party').populate('created_by').sort('-created_at').skip((page - 1) * limit).limit(limit)
            count = await Lead.find({
                has_card: showonlycardleads, state: { $in: states }, city: { $in: cities }
            }).countDocuments()
        }
        else {
            leads = await Lead.find({
                stage: { $in: stages }, state: { $in: states }, city: { $in: cities }
            }).populate('updated_by').populate('referred_party').populate('created_by').sort('-created_at').skip((page - 1) * limit).limit(limit)
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
export const ReferLead = async (req: Request, res: Response, next: NextFunction) => {
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

export const RemoveLeadReferral = async (req: Request, res: Response, next: NextFunction) => {
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


export const ConvertLeadToRefer = async (req: Request, res: Response, next: NextFunction) => {
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


export const FuzzySearchLeads = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let result: GetLeadDto[] = []
    let user = await User.findById(req.user).populate('assigned_crm_states').populate('assigned_crm_cities');
    let showonlycardleads = Boolean(user?.show_only_visiting_card_leads)
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
                alternate_mobile1:lead.lead_type == "company" ? "" : lead.alternate_mobile1,
                alternate_mobile2:lead.lead_type == "company" ? "" : lead.alternate_mobile2,
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


export const CreateLead = async (req: Request, res: Response, next: NextFunction) => {
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


export const UpdateLead = async (req: Request, res: Response, next: NextFunction) => {
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


export const DeleteLead = async (req: Request, res: Response, next: NextFunction) => {
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

export const BulkLeadUpdateFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let result: CreateAndUpdatesLeadFromExcelDto[] = []
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
        let workbook_response: CreateAndUpdatesLeadFromExcelDto[] = xlsx.utils.sheet_to_json(
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
export const BulkDeleteUselessLeads = async (req: Request, res: Response, next: NextFunction) => {
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