import { NextFunction, Request, Response } from 'express';
import isMongoId from 'validator/lib/isMongoId';
import { CreateOrEditVisitSummaryRemarkDto, GetVisitSummaryReportRemarkDto } from '../dtos/visit_remark.dto';
import { VisitRemark, IVisitRemark } from '../models/visit_remark.model';



export const UpdateVisitRemark = async (req: Request, res: Response, next: NextFunction) => {
    const { remark } = req.body as CreateOrEditVisitSummaryRemarkDto
    if (!remark) return res.status(403).json({ message: "please fill required fields" })

    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
    let rremark = await VisitRemark.findById(id)
    if (!rremark) {
        return res.status(404).json({ message: "remark not found" })
    }
    rremark.remark = remark
    await rremark.save()
    return res.status(200).json({ message: "remark updated successfully" })
}

export const DeleteVisitRemark = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
    let rremark = await VisitRemark.findById(id)
    if (!rremark) {
        return res.status(404).json({ message: "remark not found" })
    }
    await rremark.remove()
    return res.status(200).json({ message: " remark deleted successfully" })
}

export const GetVisitSummaryReportRemarkHistory = async (req: Request, res: Response, next: NextFunction) => {
    const date = req.query.date;
    const employee = req.query.employee;
    if (!date || !employee) return res.status(403).json({ message: "please fill required fields" })
    let remarks: IVisitRemark[] = []
    let dt1 = new Date(String(date))
    let dt2 = new Date(dt1)
    dt1.setHours(0, 0, 0, 0)
    dt2.setHours(0, 0, 0, 0)
    dt2.setDate(dt1.getDate() + 1)

    let result: GetVisitSummaryReportRemarkDto[] = []
    remarks = await VisitRemark.find({ employee: employee, visit_date: { $gte: dt1, $lt: dt2 } }).populate('created_by').populate('employee').sort('-created_at')


    result = remarks.map((r) => {
        return {
            _id: r._id,
            remark: r.remark,
            employee: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username },
            created_at: r.created_at.toString(),
            visit_date: r.visit_date.toString(),
            created_by: r.created_by.username
        }
    })
    return res.json(result)
}


export const NewVisitRemark = async (req: Request, res: Response, next: NextFunction) => {
    const { remark, employee, visit_date } = req.body as CreateOrEditVisitSummaryRemarkDto
    if (!remark || !employee || !visit_date) return res.status(403).json({ message: "please fill required fields" })

    await new VisitRemark({
        remark,
        employee,
        visit_date: new Date(visit_date),
        created_at: new Date(Date.now()),
        created_by: req.user,
        updated_at: new Date(Date.now()),
        updated_by: req.user
    }).save()
    return res.status(200).json({ message: "remark added successfully" })
}