import { NextFunction, Request, Response } from 'express';
import { GetSalesAttendancesAuto, GetVisitReportDto } from "../dtos";
import moment from "moment";
import { VisitReport } from "../models/visit-report";
import { decimalToTimeForXlsx } from '../utils/datesHelper';
import { IUser, User } from '../models/user';


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



export const GetSalesAttendancesAutoReport = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetSalesAttendancesAuto[] = []
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let salesman: IUser[] = []
    salesman = await User.find({ assigned_permissions: 'sales_menu' })

    if (!start_date || !end_date) {
        return res.status(400).json({ error: "Dates  are required." });
    }
    let dt1 = new Date(String(start_date))
    let dt2 = new Date(String(end_date))
    dt1.setHours(0, 0, 0, 0)
    dt2.setHours(0, 0, 0, 0)

    let current_date = new Date(dt1)
    while (current_date <= new Date(dt2)) {
        
        for (let i = 0; i < salesman.length; i++) {
            let oldvisit1 = 0
            let newvisit1 = 0
            let worktime1 = ''
            let currdate1 = new Date(current_date)
            let currdate2 = new Date(currdate1)
            currdate1.setHours(0, 0, 0, 0)
            currdate2.setHours(0, 0, 0, 0)
            currdate2.setDate(currdate1.getDate() + 1)
            
            let data = await VisitReport.find({ employee: salesman[i], visit_date: { $gte: currdate1, $lt: currdate2 } })
            if (data) {
                let start = ""
                let end = ""
                for (let k = 0; k < data.length; k++) {
                    if (data[k].customer && checkifNewCustomer(data[k].customer))
                        newvisit1 = newvisit1 + 1
                    else if (data[k].customer && data[k].customer.includes('*')) {
                        oldvisit1 = oldvisit1
                        newvisit1 = newvisit1
                    }
                    else
                        oldvisit1 = oldvisit1 + 1

                    if (k == 0) {
                        start = decimalToTimeForXlsx(data[k].intime)
                    }
                    end = decimalToTimeForXlsx(data[k].outtime)

                }
                worktime1 = start + " - " + end
            }

            let names = [String(salesman[i].username), String(salesman[i].alias1 || ""), String(salesman[i].alias2 || "")].filter(value => value)
            result.push({
                employee: {
                    id: salesman[i]._id, label: names.toString(), value: salesman[i]
                        .username
                },
                date: moment(current_date).format("DD/MM/YYYY"),
                old_visit: oldvisit1,
                new_visit: newvisit1,
                worktime: worktime1,
            })

        }
        current_date.setDate(new Date(current_date).getDate() + 1)
    } ``

    return res.status(200).json(result)
}


function checkifNewCustomer(customer: string) {
    let isCustomer = false
    let items = ["train", 'hotel', 'election', 'shut', 'travel', 'leave', 'office','close','sunday','home']
    if (customer.includes('*')) {
        let result = true
        for (let i = 0; i < items.length; i++) {
            if (customer && customer.toLowerCase().includes(items[i])) {
                result = false
                break;
            }
        }
        isCustomer = result
    }

    return isCustomer
}