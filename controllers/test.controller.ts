import { NextFunction, Request, Response } from 'express';
import { KeyCategory } from '../models/key-category';
import { ExcelDB } from '../models/excel-db';
import { IUser, User } from '../models/user';
import { currentMonth, decimalToTimeForXlsx, nextMonth, nextYear, previousYear } from '../utils/datesHelper';
import moment from 'moment';
import { GetSalesManVisitSummaryReportDto } from '../dtos';

export const test = async (req: Request, res: Response, next: NextFunction) => {

    let cmcy = new Date()
    // let cmly = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
    // let lmcy = new Date(new Date().setMonth(new Date().getMonth() - 1))
    // let lmly = new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setFullYear(new Date().getFullYear() - 1))
    cmcy.setHours(0, 0, 0, 0)

    let salrepcat = await KeyCategory.findOne({ category: 'SalesRep' })

    let currentmonth = new Date()
    currentmonth.setDate(1)
    currentmonth.setMonth(currentmonth.getMonth())
    currentmonth.setHours(0, 0, 0, 0)

    //previous year
    const lastMonthYearSale1 = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Sales', 'Sales Representative': currentmonth })
    if (lastMonthYearSale1) {
        //@ts-ignore
        let currentsale_last_year = lastMonthYearSale1[`KARNATAKA`]
    }


    return res.status(200).json(lastMonthYearSale1)
}