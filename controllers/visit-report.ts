import { NextFunction, Request, Response } from 'express';
import { GetVisitReportDto } from "../dtos";
import moment from "moment";
import { VisitReport } from "../models/visit-report";
import { decimalToTimeForXlsx } from '../utils/datesHelper';


export const GetVisitReports = async (req: Request, res: Response, next: NextFunction) => {

    let employee = req.query.employee
    if (!employee)
        return res.status(400).json({ message: "please select employee" })
    let reports: GetVisitReportDto[] = (await VisitReport.find({ employee: employee }).populate('employee').populate('created_by').populate('updated_by').sort('-visit_date')).map((i) => {
        return {
            _id: i._id,
            employee: i.employee.username,
            visit_date: moment(i.visit_date).format("DD/MM/YYYY"),
            customer: i.customer,
            intime: decimalToTimeForXlsx(i.intime),
            outtime: decimalToTimeForXlsx(i.outtime),
            visitInLocation: i.visitInLocation,
            visitOutLocation: i.visitOutLocation,
            remarks: i.remarks,
            created_by: i.created_by.username,
            updated_by: i.updated_by.username,
            created_at: moment(i.created_at).format("DD/MM/YYYY"),
            updated_at: moment(i.updated_at).format("DD/MM/YYYY")
        }
    })
    return res.status(200).json(reports);
}

