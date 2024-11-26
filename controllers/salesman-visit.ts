import { NextFunction, Request, Response } from 'express';
import { GetSalesManVisitSummaryReportDto } from '../dtos';
import { IUser, User } from '../models/user';
import { decimalToTimeForXlsx } from '../utils/datesHelper';
import moment from 'moment';
import { VisitReport } from '../models/visit-report';
import { VisitRemark } from '../models/visit_remark';


export const GetSalesManVisitReport = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetSalesManVisitSummaryReportDto[] = []
    let date = req.query.date
    if (!date) {
        return res.status(400).json({ error: "Date  is required." });
    }

    let salesman: IUser[] = []
    salesman = await User.find({ assigned_permissions: 'salesman_visit_view' })
    let dt1 = new Date(String(date))
    let dt2 = new Date(dt1)
    let dt3 = new Date(dt1)
    let dt4 = new Date(dt1)
    dt1.setHours(0, 0, 0, 0)
    dt2.setHours(0, 0, 0, 0)
    dt3.setHours(0, 0, 0, 0)
    dt4.setHours(0, 0, 0, 0)

    dt2.setDate(dt1.getDate())
    dt3.setDate(dt1.getDate() - 1)
    dt4.setDate(dt1.getDate() - 2)
    dt1.setDate(dt1.getDate() + 1)


    for (let i = 0; i < salesman.length; i++) {
        let rremark = await VisitRemark.findOne({ employee: salesman[i], visit_date: { $gte: dt2, $lt: dt1 } }).sort('-created_at')
        let lastremark = ""
        if (rremark)
            lastremark = rremark?.remark
        let oldvisit1 = 0
        let newvisit1 = 0
        let worktime1 = ''
        let oldvisit2 = 0
        let newvisit2 = 0
        let worktime2 = ''
        let oldvisit3 = 0
        let newvisit3 = 0
        let worktime3 = ''


        let data1 = await VisitReport.find({ employee: salesman[i], visit_date: { $gte: dt2, $lt: dt1 } })
        let data2 = await VisitReport.find({ employee: salesman[i], visit_date: { $gte: dt3, $lt: dt2 } })
        let data3 = await VisitReport.find({ employee: salesman[i], visit_date: { $gte: dt4, $lt: dt3 } })

        if (data3) {
            let start = ""
            let end = ""
            for (let k = 0; k < data3.length; k++) {
                if (data3[k].customer && data3[k].customer.includes('*'))
                    newvisit3 = newvisit3 + 1
                else
                    oldvisit3 = oldvisit3 + 1

                if (k == 0) {
                    start = decimalToTimeForXlsx(data3[k].intime)
                }
                end = decimalToTimeForXlsx(data3[k].outtime)

            }
            worktime3 = start + " - " + end
        }
        if (data2) {
            let start = ""
            let end = ""
            for (let k = 0; k < data2.length; k++) {
                if (data2[k].customer && data2[k].customer.includes('*'))
                    newvisit2 = newvisit2 + 1
                else
                    oldvisit2 = oldvisit2 + 1

                if (k == 0) {
                    start = decimalToTimeForXlsx(data2[k].intime)
                }
                end = decimalToTimeForXlsx(data2[k].outtime)

            }
            worktime2 = start + " - " + end
        }
        if (data1) {
            let start = ""
            let end = ""
            for (let k = 0; k < data1.length; k++) {
                if (data1[k].customer && data1[k].customer.includes('*'))
                    newvisit1 = newvisit1 + 1
                else
                    oldvisit1 = oldvisit1 + 1

                if (k == 0) {
                    start = decimalToTimeForXlsx(data1[k].intime)
                }
                end = decimalToTimeForXlsx(data1[k].outtime)

            }
            worktime1 = start + " - " + end
        }
        let names = [String(salesman[i].username), String(salesman[i].alias1 || ""), String(salesman[i].alias2 || "")].filter(value => value)
        result.push({
            employee: {
                id: salesman[i]._id, label: names.toString(), value: salesman[i]
                    .username
            },
            date1: moment(dt2).format("DD/MM/YYYY"),
            old_visits1: oldvisit1,
            new_visits1: newvisit1,
            working_time1: worktime1,
            date2: moment(dt3).format("DD/MM/YYYY"),
            old_visits2: oldvisit2,
            new_visits2: newvisit2,
            working_time2: worktime2,
            date3: moment(dt4).format("DD/MM/YYYY"),
            old_visits3: oldvisit3,
            new_visits3: newvisit3,
            working_time3: worktime3,
            last_remark: lastremark
        })

    }
    return res.status(200).json(result)
}

