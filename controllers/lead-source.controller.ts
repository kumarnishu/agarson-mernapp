import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';

import isMongoId from "validator/lib/isMongoId";
import { DropDownDto } from "../dtos/dropdown.dto";
import { LeadSource } from "../models/crm-source.model";
import Lead from "../models/lead.model";
import { ReferredParty } from "../models/refer.model";

export const GetAllCRMLeadSources = async (req: Request, res: Response, next: NextFunction) => {
    let result: DropDownDto[] = []
    let sources = await LeadSource.find()
    result = sources.map((i) => {
        return { id: i._id, value: i.source, label: i.source }
    })
    return res.status(200).json(result)
}


export const CreateCRMLeadSource = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as  {key:string}
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await LeadSource.findOne({ source: key.toLowerCase() }))
        return res.status(400).json({ message: "already exists this source" })
    let result = await new LeadSource({
        source: key,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}

export const UpdateCRMLeadSource = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as  {key:string}
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldsource = await LeadSource.findById(id)
    if (!oldsource)
        return res.status(404).json({ message: "source not found" })
    if (key !== oldsource.source)
        if (await LeadSource.findOne({ source: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this source" })
    let prevsource = oldsource.source
    oldsource.source = key
    oldsource.updated_at = new Date()
    if (req.user)
        oldsource.updated_by = req.user
    await Lead.updateMany({ source: prevsource }, { source: key })
    await ReferredParty.updateMany({ source: prevsource }, { source: key })
    await oldsource.save()
    return res.status(200).json(oldsource)

}
export const DeleteCRMLeadSource = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "source id not valid" })
    let source = await LeadSource.findById(id);
    if (!source) {
        return res.status(404).json({ message: "source not found" })
    }
    await source.remove();
    return res.status(200).json({ message: "lead source deleted successfully" })
}
