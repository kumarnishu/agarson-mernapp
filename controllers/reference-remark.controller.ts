import { NextFunction, Request, Response } from 'express';
import isMongoId from 'validator/lib/isMongoId';
import moment from 'moment';
import { CreateOrEditReferenceRemarkDto, GetReferenceRemarksDto } from '../dtos/references-remark.dto';
import { IReferenceRemark, ReferenceRemark } from '../models/reference-remarks.model';


export const UpdateReferenceRemark = async (req: Request, res: Response, next: NextFunction) => {
    const { remark, next_date } = req.body as CreateOrEditReferenceRemarkDto
    if (!remark) return res.status(403).json({ message: "please fill required fields" })

    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
    let rremark = await ReferenceRemark.findById(id)
    if (!rremark) {
        return res.status(404).json({ message: "remark not found" })
    }
    rremark.remark = remark
    if (next_date)
        rremark.next_call = new Date(next_date)
    await rremark.save()
    return res.status(200).json({ message: "remark updated successfully" })
}

export const DeleteReferenceRemark = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
    let rremark = await ReferenceRemark.findById(id)
    if (!rremark) {
        return res.status(404).json({ message: "remark not found" })
    }
    await rremark.remove()
    return res.status(200).json({ message: " remark deleted successfully" })
}


export const GetReferenceRemarkHistory = async (req: Request, res: Response, next: NextFunction) => {
    const party = req.query.party
    const reference = req.query.reference
    let remarks: IReferenceRemark[] = []
    let result: GetReferenceRemarksDto[] = []
    remarks = await ReferenceRemark.find({  party: String(party).trim().toLowerCase(), reference: String(reference).trim().toLowerCase() }).populate('created_by').sort('-created_at')

    result = remarks.map((r) => {
        return {
            _id: r._id,
            remark: r.remark,
            party: r.party,
            ref: r.reference,
            next_date: r.next_call ? moment(r.next_call).format('DD/MM/YYYY') : "",
            created_date: r.created_at.toString(),
            created_by: r.created_by.username
        }
    })
    return res.json(result)
}

export const NewReferenceRemark = async (req: Request, res: Response, next: NextFunction) => {
    const {
        remark,
        party,
        ref,
        next_date } = req.body as CreateOrEditReferenceRemarkDto
    if (!remark || !party || !ref) return res.status(403).json({ message: "please fill required fields" })



    let new_remark = new ReferenceRemark({
        remark,
        party: party.trim().toLowerCase(),
        ref: ref.trim().toLowerCase(),
        created_at: new Date(Date.now()),
        created_by: req.user,
        updated_at: new Date(Date.now()),
        updated_by: req.user
    })
    if (next_date)
        new_remark.next_call = new Date(next_date)
    await new_remark.save()
    return res.status(200).json({ message: "remark added successfully" })
}