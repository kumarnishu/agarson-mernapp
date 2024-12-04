import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';

import isMongoId from "validator/lib/isMongoId";
import { DropDownDto } from "../dtos/dropdown.dto";
import { Stage } from "../models/crm-stage.model";
import Lead from "../models/lead.model";
import { ReferredParty } from "../models/refer.model";

export const GetAllCRMLeadStages = async (req: Request, res: Response, next: NextFunction) => {
    let stages: DropDownDto[] = []
    stages = await (await Stage.find()).map((i) => { return { id: i._id, label: i.stage, value: i.stage } });
    return res.status(200).json(stages)
}


export const CreateCRMLeadStages = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as {key:string}
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await Stage.findOne({ stage: key.toLowerCase() }))
        return res.status(400).json({ message: "already exists this stage" })
    let result = await new Stage({
        stage: key,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}

export const UpdateCRMLeadStages = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as { key: string }

    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldstage = await Stage.findById(id)
    if (!oldstage)
        return res.status(404).json({ message: "stage not found" })
    if (key !== oldstage.stage)
        if (await Stage.findOne({ stage: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this stage" })
    let prevstage = oldstage.stage
    oldstage.stage = key
    oldstage.updated_at = new Date()
    if (req.user)
        oldstage.updated_by = req.user
    await Lead.updateMany({ stage: prevstage }, { stage: key })
    await ReferredParty.updateMany({ stage: prevstage }, { stage: key })
    await oldstage.save()
    return res.status(200).json(oldstage)

}
export const DeleteCRMLeadStage = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "stage id not valid" })
    let stage = await Stage.findById(id);
    if (!stage) {
        return res.status(404).json({ message: "stage not found" })
    }
    await stage.remove();
    return res.status(200).json({ message: "lead stage deleted successfully" })
}
export const FindUnknownCrmStages = async (req: Request, res: Response, next: NextFunction) => {
    let stages = await Stage.find({ stage: { $ne: "" } });
    let stagevalues = stages.map(i => { return i.stage });
    await Lead.updateMany({ stage: { $nin: stagevalues } }, { stage: 'unknown' });
    return res.status(200).json({ message: "successfull" })
}
