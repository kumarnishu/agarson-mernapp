import { NextFunction, Request, Response } from 'express';
import { KeyCategory } from '../models/key-category';
import { ExcelDB } from '../models/excel-db';
import { IUser, User } from '../models/user';
import { decimalToTimeForXlsx } from '../utils/datesHelper';
import moment from 'moment';
import { GetSalesManVisitSummaryReportDto } from '../dtos';

export const test = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetSalesManVisitSummaryReportDto[] = []
    let date = req.query.date
    if (!date) {
        return res.status(400).json({ error: "Date  is required." });
    }

    let salesman: IUser[] = []
    salesman = await User.find({ assigned_permissions: 'sales_menu' })
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
    let cat = await KeyCategory.findOne({ category: 'visitsummary' })

    for (let i = 0; i < salesman.length; i++) {
        let names = [String(salesman[i].username), String(salesman[i].alias1 || ""), String(salesman[i].alias2 || "")].filter(value => value)

        const regexNames = names.map(name => new RegExp(`^${name}$`, 'i'));
        let oldvisit1 = 0
        let newvisit1 = 0
        let worktime1 = ''
        let oldvisit2 = 0
        let newvisit2 = 0
        let worktime2 = ''
        let oldvisit3 = 0
        let newvisit3 = 0
        let worktime3 = ''


        let data1 = await ExcelDB.find({ category: cat, "Visit Date": { $gte: dt2, $lt: dt1 }, 'Employee Name': { $in: regexNames } })
        let data2 = await ExcelDB.find({ category: cat, "Visit Date": { $gte: dt3, $lt: dt2 }, 'Employee Name': { $in: regexNames } })
        let data3 = await ExcelDB.find({ category: cat, "Visit Date": { $gte: dt4, $lt: dt3 }, 'Employee Name': { $in: regexNames } })
        console.log(data3)
        if (data3) {
            let start = ""
            let end = ""
            for (let k = 0; k < data3.length; k++) {
                //@ts-ignore
                console.log(data3[k]["Customer Name"])
                //@ts-ignore
                if (data3[k]["Customer Name"] && data3[k]["Customer Name"].includes('*'))
                    newvisit3 += newvisit3 + 1
                oldvisit3 + oldvisit3 + 1

                if (k == 0) {
                    //@ts-ignore
                    start = decimalToTimeForXlsx(data3[k]['In Time'])
                    //@ts-ignore
                    end = decimalToTimeForXlsx(data3[k]['Out Time'])
                }

            }
            worktime3 = start + " - " + end
        }
        if (data2) {
            let start = ""
            let end = ""
            for (let k = 0; k < data2.length; k++) {
                //@ts-ignore
                console.log(data2[k]["Customer Name"])
                //@ts-ignore
                if (data2[k]["Customer Name"] && data2[k]["Customer Name"].includes('*'))
                    newvisit2 += newvisit2 + 1
                oldvisit2 + oldvisit2 + 1

                if (k == 0) {
                    //@ts-ignore
                    start = decimalToTimeForXlsx(data2[k]['In Time'])
                    //@ts-ignore
                    end = decimalToTimeForXlsx(data2[k]['Out Time'])
                }

            }
            worktime2 = start + " - " + end
        }
        if (data1) {
            let start = ""
            let end = ""
            for (let k = 0; k < data1.length; k++) {
                //@ts-ignore
                console.log(data1[k]["Customer Name"])
                //@ts-ignore
                if (data1[k]["Customer Name"] && data1[k]["Customer Name"].includes('*'))
                    newvisit1 += newvisit1 + 1
                oldvisit1 + oldvisit1 + 1

                if (k == 0) {
                    //@ts-ignore
                    start = decimalToTimeForXlsx(data1[k]['In Time'])
                    //@ts-ignore
                    end = decimalToTimeForXlsx(data1[k]['Out Time'])
                }

            }
            worktime1 = start + " - " + end
        }

        result.push({
            employee: { id: salesman[i]._id, label: salesman[i].username, value: salesman[i].username },
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
            last_remark:""
        })

    }
    return res.status(200).json(result)
}