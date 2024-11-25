import { NextFunction, Request, Response } from 'express';
import { GetVisitReportDto } from "../dtos";
import moment from "moment";
import { VisitReport } from "../models/visit-report";
import { IUser } from '../models/user';


export const GetVisitReports = async (req: Request, res: Response, next: NextFunction) => {
    let employee_ids = req.user?.assigned_erpEmployees.map((employee: IUser) => { return employee }) || []
    let reports: GetVisitReportDto[] = (await VisitReport.find({ employee: { $in: employee_ids } }).populate('employee').populate('created_by').populate('updated_by')).map((i) => {
        return {
            _id: i._id,
            employee: i.employee.username,
            visit_date: moment(i.visit_date).format("DD/MM/YYYY"),
            customer: i.customer,
            intime: i.intime,
            outtime: i.outtime,
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

