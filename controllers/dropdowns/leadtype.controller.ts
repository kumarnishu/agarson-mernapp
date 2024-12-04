import { NextFunction, Request, Response } from 'express';
import isMongoId from "validator/lib/isMongoId";
import { DropDownDto } from "../../dtos";
import { LeadType } from "../../models/crm-leadtype";
import Lead from "../../models/lead";
import { ReferredParty } from "../../models/refer";

export const GetAllCRMLeadTypes = async (req: Request, res: Response, next: NextFunction) => {
    let result: DropDownDto[] = []
    let types = await LeadType.find()
    result = types.map((t) => {
        return { id: t._id, value: t.type, label: t.type }
    })
    return res.status(200).json(result)
}


export const CreateCRMLeadTypes = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as {key:string}
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await LeadType.findOne({ type: key.toLowerCase() }))
        return res.status(400).json({ message: "already exists this type" })
    let result = await new LeadType({
        type: key,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json({ message: "success" })

}

export const UpdateCRMLeadTypes = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as {key:string}
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldtype = await LeadType.findById(id)
    if (!oldtype)
        return res.status(404).json({ message: "type not found" })
    if (key !== oldtype.type)
        if (await LeadType.findOne({ type: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this type" })
    let prevtype = oldtype.type
    oldtype.type = key
    oldtype.updated_at = new Date()
    if (req.user)
        oldtype.updated_by = req.user
    await Lead.updateMany({ type: prevtype }, { type: key })
    await ReferredParty.updateMany({ type: prevtype }, { type: key })
    await oldtype.save()
    return res.status(200).json({ message: "updated" })

}
export const DeleteCRMLeadType = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "type id not valid" })
    let type = await LeadType.findById(id);
    if (!type) {
        return res.status(404).json({ message: "type not found" })
    }
    await type.remove();
    return res.status(200).json({ message: "lead type deleted successfully" })
}