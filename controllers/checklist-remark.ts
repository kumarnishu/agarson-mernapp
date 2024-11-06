import { NextFunction, Request, Response } from 'express';
import { CreateOrEditChecklistRemarkDto, GetChecklistRemarksDto } from '../dtos';
import isMongoId from 'validator/lib/isMongoId';
import { ChecklistRemark, IChecklistRemark } from '../models/checklist-remark';
import { ChecklistBox } from '../models/checklist-box';
import { Checklist } from '../models/checklist';
import { areDatesEqual } from '../utils/areDatesEqual';


export const UpdateChecklistRemark = async (req: Request, res: Response, next: NextFunction) => {
    const { remark } = req.body as CreateOrEditChecklistRemarkDto
    if (!remark) return res.status(403).json({ message: "please fill required fields" })

    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
    let rremark = await ChecklistRemark.findById(id)
    if (!rremark) {
        return res.status(404).json({ message: "remark not found" })
    }
    rremark.remark = remark
    await rremark.save()
    return res.status(200).json({ message: "remark updated successfully" })
}

export const DeleteChecklistRemark = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
    let rremark = await ChecklistRemark.findById(id)
    if (!rremark) {
        return res.status(404).json({ message: "remark not found" })
    }
    await rremark.remove()
    return res.status(200).json({ message: " remark deleted successfully" })
}

export const GetChecklistRemarkHistory = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: "id not valid" })
    let box = await ChecklistBox.findById(id);
    if (!box) {
        return res.status(404).json({ message: "box not found" })
    }
    let remarks: IChecklistRemark[] = []
    let result: GetChecklistRemarksDto[] = []
    remarks = await ChecklistRemark.find({ checklist_box: id }).populate('created_by').populate('checklist_box').sort('-created_at')

    result = remarks.map((r) => {
        return {
            _id: r._id,
            remark: r.remark,
            checklist_box: { id: r.checklist_box._id, value: new Date(r.checklist_box.date).toString(), label: new Date(r.checklist_box.date).toString() },
            created_date: r.created_at.toString(),
            created_by: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username }
        }
    })
    return res.json(result)
}

export const NewChecklistRemark = async (req: Request, res: Response, next: NextFunction) => {
    const { remark, stage, checklist, checklist_box } = req.body as CreateOrEditChecklistRemarkDto
    if (!remark || !checklist_box || !checklist) return res.status(403).json({ message: "please fill required fields" })

    let box = await ChecklistBox.findById(checklist_box).populate('checklist')
    if (!box) {
        return res.status(404).json({ message: "box not found" })
    }

    let new_remark = new ChecklistRemark({
        remark,
        checklist_box,
        created_at: new Date(Date.now()),
        created_by: req.user,
        updated_at: new Date(Date.now()),
        updated_by: req.user
    })
    if (stage)
        box.stage = stage;
    await new_remark.save()

    if (req.user) {
        box.updated_by = req.user
        box.updated_at = new Date(Date.now())
    }
    await box.save()
    let checklistTmp = await Checklist.findById(box.checklist._id)
    if (stage == 'done') {
        if (checklistTmp) {
            if (checklistTmp.frequency == "daily") {
                if (areDatesEqual(box.date, new Date())) {
                    checklistTmp.active = false;
                }
            }
            else {
                checklistTmp.active = false
            }
            
        }
    }
    if (checklistTmp) {
        checklistTmp.lastcheckedbox = box
        checklistTmp.updated_by = req.user
        checklistTmp.updated_at = new Date(Date.now())
        await checklistTmp.save()
    }
    return res.status(200).json({ message: "remark added successfully" })
}