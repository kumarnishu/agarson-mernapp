import { NextFunction, Request, Response } from 'express';
import { GetVisitReportDto } from "../dtos";
import moment from "moment";
import { VisitReport } from "../models/visit-report";
import { IUser, User } from '../models/user';
import { KeyCategory } from '../models/key-category';
import { ExcelDB } from '../models/excel-db';
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


export const SaveSalesManVisitReport = async (req: Request, res: Response, next: NextFunction) => {
    let salesman: IUser[] = []
    salesman = await User.find({ assigned_permissions: 'salesman_visit_view' })
    let cat = await KeyCategory.findOne({ category: 'visitsummary' })
    //await VisitReport.deleteMany()
    for (let i = 0; i < salesman.length; i++) {
        let names = [String(salesman[i].username), String(salesman[i].alias1 || ""), String(salesman[i].alias2 || "")].filter(value => value)

        const regexNames = names.map(name => new RegExp(`^${name}$`, 'i'));
        let records = await ExcelDB.find({ category: cat, 'Employee Name': { $in: regexNames } })
        for (let k = 0; k < records.length; k++) {
            let employee = salesman[i];
            //@ts-ignore
            let date = records[k]["Visit Date"]
            let dt1 = new Date(date)
            let dt2 = new Date(dt1)
            dt1.setHours(0, 0, 0, 0)
            dt2.setHours(0, 0, 0, 0)
            dt2.setDate(dt1.getDate() + 1)
            //@ts-ignore
            let customer: records[k]["Customer"]
            let report = await VisitReport.findOne({ employee: employee, visit_date: { $gte: dt1, $lt: dt2 }, customer: customer }).sort('-created_at')
            console.log(report)
            if (!report) {
                await new VisitReport({
                    employee: employee,
                    visit_date: new Date(date),
                    //@ts-ignore
                    customer: records[k]["Customer Name"],
                    //@ts-ignore
                    intime: records[k]["In Time"],
                    //@ts-ignore
                    outtime: records[k]["Out Time"],
                    //@ts-ignore
                    visitInLocation: records[k]["Visit In Location"],
                    //@ts-ignore
                    visitOutLocation: records[k]["Visit Out Location"],
                    //@ts-ignore
                    remarks: records[k]["Remarks"],
                    created_at: new Date(),
                    updated_at: new Date(),
                    created_by: req.user,
                    updated_by: req.user,
                }).save()
            }
            // else {
            //     console.log("found", k)
            //     if (report.customer !== customer) {
            //         console.log("intime not equals", report.intime, intime, k)
            //         await new VisitReport({
            //             employee: employee,
            //             visit_date: new Date(date),
            //             //@ts-ignore
            //             customer: records[k]["Customer Name"],
            //             //@ts-ignore
            //             intime: records[k]["In Time"],
            //             //@ts-ignore
            //             outtime: records[k]["Out Time"],
            //             //@ts-ignore
            //             visitInLocation: records[k]["Visit In Location"],
            //             //@ts-ignore
            //             visitOutLocation: records[k]["Visit Out Location"],
            //             //@ts-ignore
            //             remarks: records[k]["Remarks"],
            //             created_at: new Date(),
            //             updated_at: new Date(),
            //             created_by: req.user,
            //             updated_by: req.user,
            //         }).save()
            //     }
            //     else
            //         console.log("intime equals", report.intime, intime, k)
            // }

        }
    }
    return res.status(200).json({ message: "success" })
}