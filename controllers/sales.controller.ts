import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import { IUser, User } from '../models/user';
import { ISalesAttendance, SalesAttendance } from '../models/sales-attendance';
import { VisitReport } from '../models/visit-report';
import { VisitRemark, IVisitRemark } from '../models/visit_remark';
import { SalesmanLeaves, SalesmanLeavesColumns } from '../models/salesman-leaves';
import { KeyCategory } from '../models/key-category';
import xlsx from 'xlsx';

import { 
    CreateOrEditSalesAttendanceDto, 
    GetSalesAttendanceDto, 
    GetSalesmanKpiDto, 
    GetSalesAttendancesAuto, 
    GetVisitReportDto, 
    GetSalesManVisitSummaryReportDto, 
    CreateOrEditVisitSummaryRemarkDto, 
    GetVisitSummaryReportRemarkDto, 
    IColumnRowData, 
    IRowData 
} from '../dtos';

import { toTitleCase } from '../utils/trimText';
import { decimalToTimeForXlsx } from '../utils/datesHelper';
import ConvertJsonToExcel from '../utils/ConvertJsonToExcel';
import isMongoId from 'validator/lib/isMongoId';
import { ExcelDB } from '../models/excel-db';




export const GetSalesAttendances = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let id = req.query.id
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let attendances: ISalesAttendance[] = []
    let result: GetSalesAttendanceDto[] = []
    let count = 0
    let dt1 = new Date(String(start_date))
    let dt2 = new Date(String(end_date))
    let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []

    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        if (id == 'all') {
            if (user_ids.length > 0) {
                attendances = await SalesAttendance.find({ date: { $gte: dt1, $lt: dt2 }, employee: { $in: user_ids } }).populate('station').populate('employee').populate('created_by').populate('updated_by').sort('-date').skip((page - 1) * limit).limit(limit)
                count = await SalesAttendance.find({ date: { $gte: dt1, $lt: dt2 }, employee: { $in: user_ids } }).countDocuments()
            }

            else {
                attendances = await SalesAttendance.find({ date: { $gte: dt1, $lt: dt2 }, employee: req.user?._id }).populate('station').populate('employee').populate('created_by').populate('updated_by').sort('-date').skip((page - 1) * limit).limit(limit)
                count = await SalesAttendance.find({ date: { $gte: dt1, $lt: dt2 }, employee: req.user?._id }).countDocuments()
            }
        }


        else {
            attendances = await SalesAttendance.find({ date: { $gte: dt1, $lt: dt2 }, employee: id }).populate('station').populate('employee').populate('created_by').populate('updated_by').sort('-date').skip((page - 1) * limit).limit(limit)
            count = await SalesAttendance.find({ date: { $gte: dt1, $lt: dt2 }, employee: id }).countDocuments()
        }
        result = attendances.map((p) => {
            return {
                _id: p._id,
                employee: { id: p.employee._id, value: p.employee.username, label: p.employee.username },
                attendance: p.attendance,
                new_visit: p.new_visit,
                old_visit: p.old_visit,
                remark: p.remark,
                in_time: p.in_time,
                end_time: p.end_time,
                station: { id: p.station._id, value: p.station.city, label: p.station.city },
                date: p.date.toString(),
                created_at: p.created_at && moment(p.created_at).format("DD/MM/YYYY"),
                updated_at: p.updated_at && moment(p.updated_at).format("DD/MM/YYYY"),
                created_by: { id: p.created_by._id, value: p.created_by.username, label: p.created_by.username },
                updated_by: { id: p.updated_by._id, value: p.updated_by.username, label: p.updated_by.username }
            }
        })
        return res.status(200).json({
            result,
            total: Math.ceil(count / limit),
            page: page,
            limit: limit
        })
    }
    else
        return res.status(400).json({ message: "bad request" })
}


export const CreateSalesAttendance = async (req: Request, res: Response, next: NextFunction) => {
    let {
        employee,
        date,
        attendance,
        new_visit,
        old_visit,
        in_time,
        end_time,
        remark,
        station
    } = req.body as CreateOrEditSalesAttendanceDto

    if (!employee || !date || !attendance || !station)
        return res.status(400).json({ message: "please fill all reqired fields" })
    let dt1 = new Date(date)
    let dt2 = new Date(dt1)
    dt1.setHours(0, 0, 0, 0)
    dt2.setHours(0, 0, 0, 0)
    dt2.setDate(dt1.getDate() + 1)
    let prevatt = await SalesAttendance.findOne({ employee: employee, date: { $gte: dt1, $lt: dt2 } })
    if (prevatt)
        return res.status(500).json({ message: 'Attendance already marked for this employee' })
    let att = await new SalesAttendance({
        employee,
        date: new Date(date),
        attendance,
        station,
        in_time,
        end_time,
        new_visit,
        old_visit,
        remark,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()

    return res.status(201).json(att)
}

export const UpdateSalesAttendance = async (req: Request, res: Response, next: NextFunction) => {
    let {
        employee,
        date,
        attendance,
        new_visit,
        old_visit,
        in_time,
        end_time,
        remark,
        station
    } = req.body as CreateOrEditSalesAttendanceDto

    if (!employee || !date || !attendance || !station)
        return res.status(400).json({ message: "please fill all reqired fields" })


    const id = req.params.id
    if (!isMongoId(id))
        return res.status(400).json({ message: "not a valid request" })
    let remote_attendance = await SalesAttendance.findById(id)


    if (!remote_attendance)
        return res.status(404).json({ message: "attendance not exists" })

    await SalesAttendance.findByIdAndUpdate(remote_attendance._id,
        {
            attendance,
            station,
            in_time,
            end_time,
            new_visit,
            old_visit,
            remark,
            updated_at: new Date(),
            updated_by: req.user
        })
    return res.status(200).json({ message: "attendance updated" })
}


export const DeleteSalesAttendance = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    if (!id)
        return res.status(400).json({ message: "not a valid request" })
    let attendance = await SalesAttendance.findById(id)
    if (!attendance)
        return res.status(404).json({ message: "attendance not exists" })

    await SalesAttendance.findByIdAndDelete(attendance._id)
    return res.status(200).json({ message: "attendance removed" })
}

export const GetSalesManKpi = async (req: Request, res: Response, next: NextFunction) => {
    let id = req.query.id
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let result: GetSalesmanKpiDto[] = []
    let dt1 = new Date(String(start_date))
    let dt2 = new Date(String(end_date))
    let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []

    if (id == 'all') {
        if (req.user.assigned_users && req.user.assigned_users.length > 0) {
            let salesman = await User.find({ _id: { $in: user_ids }, assigned_permissions: 'sales_menu' })
            let current_date = new Date(dt1)
            while (current_date <= new Date(dt2)) {

                for (let i = 0; i < salesman.length; i++) {
                    let currdate1 = new Date(current_date)
                    let currdate2 = new Date(currdate1)

                    currdate1.setHours(0, 0, 0, 0)
                    currdate2.setHours(0, 0, 0, 0)
                    currdate2.setDate(currdate1.getDate() + 1)


                    let ageing_above_90days = 0;
                    let newclients = 0;
                    let currentcollection = 0;
                    let currentsale_currentyear = 0;
                    let lastsale_currentyear = 0;
                    let currentsale_last_year = 0;
                    let lastsale_lastyear = 0;
                    let attendance = await SalesAttendance.findOne({ date: { $gte: currdate1, $lt: currdate2 }, employee: salesman[i] }).populate('station').populate('employee')
                    if (attendance) {
                        //new clients
                        let parttargetcat = await KeyCategory.findOne({ category: 'PartyTarget' })
                        newclients = await ExcelDB.find({ category: parttargetcat, 'STATE NAME': new RegExp(`^${attendance?.station.state}$`, 'i'), 'Create Date': { $gte: currdate1, $lt: currdate2 } }).countDocuments()
                        //bills ageing
                        let billsageingcat = await KeyCategory.findOne({ category: 'BillsAge' })
                        const ageingdocs = await ExcelDB.find({ category: billsageingcat, 'Sales Representative': new RegExp(`^${attendance?.station.state}$`, 'i') })

                        if (ageingdocs && ageingdocs.length > 0) {
                            ageing_above_90days = ageingdocs.reduce((total, doc) => {
                                //@ts-ignore
                                return total + (doc['90-120'] || 0) + (doc['> 120'] || 0);
                            }, 0);
                        }

                        //sale and collection
                        let salrepcat = await KeyCategory.findOne({ category: 'SalesRep' })
                        if (salrepcat) {
                            let currentmonthcurrentyear = new Date()
                            currentmonthcurrentyear.setDate(1)
                            currentmonthcurrentyear.setHours(0, 0, 0, 0)
                            const currentMonthYearSale1 = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Sales', 'Sales Representative': currentmonthcurrentyear })
                            //current year
                            if (currentMonthYearSale1) {
                                //@ts-ignore
                                currentsale_currentyear = currentMonthYearSale1[`${String(attendance?.station.state).toUpperCase()}`]
                                if (!currentsale_currentyear) {
                                    //@ts-ignore
                                    currentsale_currentyear = currentMonthYearSale1[`${toTitleCase(attendance?.station.state)}`]
                                }

                            }

                            let lastmonthcurrentyear = new Date()
                            lastmonthcurrentyear.setDate(1)
                            lastmonthcurrentyear.setMonth(lastmonthcurrentyear.getMonth() - 1)
                            lastmonthcurrentyear.setHours(0, 0, 0, 0)
                            const currentMonthYearSale2 = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Sales', 'Sales Representative': lastmonthcurrentyear })
                            if (currentMonthYearSale2) {
                                //@ts-ignore
                                lastsale_currentyear = currentMonthYearSale2[`${String(attendance?.station.state).toUpperCase()}`]
                                if (!lastsale_currentyear) {
                                    //@ts-ignore
                                    lastsale_currentyear = currentMonthYearSale2[`${toTitleCase(attendance?.station.state)}`]
                                }
                            }



                            let currentmonthlastyear = new Date()
                            currentmonthlastyear.setDate(1)
                            currentmonthlastyear.setHours(0, 0, 0, 0)
                            currentmonthlastyear.setFullYear(currentmonthlastyear.getFullYear() - 1)
                            //previous year
                            const lastMonthYearSale1 = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Sales', 'Sales Representative': currentmonthlastyear })
                            if (lastMonthYearSale1) {
                                //@ts-ignore
                                currentsale_last_year = lastMonthYearSale1[`${String(attendance?.station.state).toUpperCase()}`]
                                if (!currentsale_last_year) {
                                    //@ts-ignore
                                    currentsale_last_year = lastMonthYearSale1[`${toTitleCase(attendance?.station.state)}`]
                                }
                            }


                            let lastmonthlastyear = new Date()
                            lastmonthlastyear.setDate(1)
                            lastmonthlastyear.setMonth(lastmonthlastyear.getMonth() - 1)
                            lastmonthlastyear.setHours(0, 0, 0, 0)
                            lastmonthlastyear.setFullYear(lastmonthlastyear.getFullYear() - 1)
                            const lastMonthYearSale2 = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Sales', 'Sales Representative': lastmonthlastyear })
                            if (lastMonthYearSale2) {
                                //@ts-ignore
                                lastsale_lastyear = lastMonthYearSale2[`${String(attendance?.station.state).toUpperCase()}`]

                                if (!lastsale_lastyear) {
                                    //@ts-ignore
                                    lastsale_lastyear = lastMonthYearSale2[`${toTitleCase(attendance?.station.state)}`]
                                }
                            }



                            const collectioncurrent = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Collection', 'Sales Representative': currentmonthcurrentyear })
                            if (collectioncurrent) {
                                //@ts-ignore
                                currentcollection = collectioncurrent[`${String(attendance?.station.state).toUpperCase()}`]
                                if (!currentcollection) {
                                    //@ts-ignore
                                    currentcollection = collectioncurrent[`${toTitleCase(attendance?.station.state)}`]
                                }
                            }
                        }
                    }


                    let obj: GetSalesmanKpiDto = {
                        employee: { id: salesman[i]._id, label: salesman[i].username, value: salesman[i].username },
                        date: moment(currdate1).format("DD/MM/YYYY"),
                        month: moment(currdate1).format("MMMM"),
                        attendance: attendance?.attendance,
                        new_visit: attendance?.new_visit,
                        old_visit: attendance?.old_visit,
                        working_time: (attendance?.in_time || "") + "-" + (attendance?.end_time || ""),
                        new_clients: newclients,
                        station: attendance?.station && { id: attendance?.station._id, label: attendance?.station.city, value: attendance?.station.city },
                        state: attendance?.station.state,
                        currentsale_currentyear: currentsale_currentyear,
                        lastsale_currentyear: lastsale_currentyear,
                        currentsale_last_year: currentsale_last_year,
                        lastsale_lastyear: lastsale_lastyear,
                        current_collection: currentcollection,
                        //@ts-ignore
                        ageing_above_90days: ageing_above_90days,
                        sale_growth: currentsale_currentyear / currentsale_last_year,
                        last_month_sale_growth: lastsale_currentyear / lastsale_lastyear

                    }
                    result.push(obj)
                }
                current_date.setDate(new Date(current_date).getDate() + 1)
            }``
        }
        else {
            let current_date = new Date(dt1)
            while (current_date <= new Date(dt2)) {
                let currdate1 = new Date(current_date)
                let currdate2 = new Date(currdate1)

                currdate1.setHours(0, 0, 0, 0)
                currdate2.setHours(0, 0, 0, 0)
                currdate2.setDate(currdate1.getDate() + 1)


                let ageing_above_90days = 0;
                let newclients = 0;
                let currentcollection = 0;
                let currentsale_currentyear = 0;
                let lastsale_currentyear = 0;
                let currentsale_last_year = 0;
                let lastsale_lastyear = 0;
                let attendance = await SalesAttendance.findOne({ date: { $gte: currdate1, $lt: currdate2 }, employee: req.user._id }).populate('station').populate('employee')
                if (attendance) {
                    //new clients
                    let parttargetcat = await KeyCategory.findOne({ category: 'PartyTarget' })
                    newclients = await ExcelDB.find({ category: parttargetcat, 'STATE NAME': new RegExp(`^${attendance?.station.state}$`, 'i'), 'Create Date': { $gte: currdate1, $lt: currdate2 } }).countDocuments()
                    //bills ageing
                    let billsageingcat = await KeyCategory.findOne({ category: 'BillsAge' })
                    const ageingdocs = await ExcelDB.find({ category: billsageingcat, 'Sales Representative': new RegExp(`^${attendance?.station.state}$`, 'i') })

                    if (ageingdocs && ageingdocs.length > 0) {
                        ageing_above_90days = ageingdocs.reduce((total, doc) => {
                            //@ts-ignore
                            return total + (doc['90-120'] || 0) + (doc['> 120'] || 0);
                        }, 0);
                    }

                    //sale and collection
                    let salrepcat = await KeyCategory.findOne({ category: 'SalesRep' })
                    if (salrepcat) {
                        let currentmonthcurrentyear = new Date()
                        currentmonthcurrentyear.setDate(1)
                        currentmonthcurrentyear.setHours(0, 0, 0, 0)
                        const currentMonthYearSale1 = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Sales', 'Sales Representative': currentmonthcurrentyear })
                        //current year
                        if (currentMonthYearSale1) {
                            //@ts-ignore
                            currentsale_currentyear = currentMonthYearSale1[`${String(attendance?.station.state).toUpperCase()}`]
                            if (!currentsale_currentyear) {
                                //@ts-ignore
                                currentsale_currentyear = currentMonthYearSale1[`${toTitleCase(attendance?.station.state)}`]
                            }

                        }

                        let lastmonthcurrentyear = new Date()
                        lastmonthcurrentyear.setDate(1)
                        lastmonthcurrentyear.setMonth(lastmonthcurrentyear.getMonth() - 1)
                        lastmonthcurrentyear.setHours(0, 0, 0, 0)
                        const currentMonthYearSale2 = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Sales', 'Sales Representative': lastmonthcurrentyear })
                        if (currentMonthYearSale2) {
                            //@ts-ignore
                            lastsale_currentyear = currentMonthYearSale2[`${String(attendance?.station.state).toUpperCase()}`]
                            if (!lastsale_currentyear) {
                                //@ts-ignore
                                lastsale_currentyear = currentMonthYearSale2[`${toTitleCase(attendance?.station.state)}`]
                            }
                        }



                        let currentmonthlastyear = new Date()
                        currentmonthlastyear.setDate(1)
                        currentmonthlastyear.setHours(0, 0, 0, 0)
                        currentmonthlastyear.setFullYear(currentmonthlastyear.getFullYear() - 1)
                        //previous year
                        const lastMonthYearSale1 = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Sales', 'Sales Representative': currentmonthlastyear })
                        if (lastMonthYearSale1) {
                            //@ts-ignore
                            currentsale_last_year = lastMonthYearSale1[`${String(attendance?.station.state).toUpperCase()}`]
                            if (!currentsale_last_year) {
                                //@ts-ignore
                                currentsale_last_year = lastMonthYearSale1[`${toTitleCase(attendance?.station.state)}`]
                            }
                        }


                        let lastmonthlastyear = new Date()
                        lastmonthlastyear.setDate(1)
                        lastmonthlastyear.setMonth(lastmonthlastyear.getMonth() - 1)
                        lastmonthlastyear.setHours(0, 0, 0, 0)
                        lastmonthlastyear.setFullYear(lastmonthlastyear.getFullYear() - 1)
                        const lastMonthYearSale2 = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Sales', 'Sales Representative': lastmonthlastyear })
                        if (lastMonthYearSale2) {
                            //@ts-ignore
                            lastsale_lastyear = lastMonthYearSale2[`${String(attendance?.station.state).toUpperCase()}`]

                            if (!lastsale_lastyear) {
                                //@ts-ignore
                                lastsale_lastyear = lastMonthYearSale2[`${toTitleCase(attendance?.station.state)}`]
                            }
                        }



                        const collectioncurrent = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Collection', 'Sales Representative': currentmonthcurrentyear })
                        if (collectioncurrent) {
                            //@ts-ignore
                            currentcollection = collectioncurrent[`${String(attendance?.station.state).toUpperCase()}`]
                            if (!currentcollection) {
                                //@ts-ignore
                                currentcollection = collectioncurrent[`${toTitleCase(attendance?.station.state)}`]
                            }
                        }
                    }
                }


                let obj: GetSalesmanKpiDto = {
                    employee: { id: req.user, label: req.user.username, value: req.user.username },
                    date: moment(currdate1).format("DD/MM/YYYY"),
                    month: moment(currdate1).format("MMMM"),
                    attendance: attendance?.attendance,
                    new_visit: attendance?.new_visit,
                    old_visit: attendance?.old_visit,
                    working_time: (attendance?.in_time || "") + "-" + (attendance?.end_time || ""),
                    new_clients: newclients,
                    station: attendance?.station && { id: attendance?.station._id, label: attendance?.station.city, value: attendance?.station.city },
                    state: attendance?.station.state,
                    currentsale_currentyear: currentsale_currentyear,
                    lastsale_currentyear: lastsale_currentyear,
                    currentsale_last_year: currentsale_last_year,
                    lastsale_lastyear: lastsale_lastyear,
                    current_collection: currentcollection,
                    //@ts-ignore
                    ageing_above_90days: ageing_above_90days,
                    sale_growth: currentsale_currentyear / currentsale_last_year,
                    last_month_sale_growth: lastsale_currentyear / lastsale_lastyear

                }
                result.push(obj)
                current_date.setDate(new Date(current_date).getDate() + 1)
            }
        }
    }
    else {
        let user = await User.findById(id)
        if (user) {
            let current_date = new Date(dt1)
            while (current_date <= new Date(dt2)) {
                let currdate1 = new Date(current_date)
                let currdate2 = new Date(currdate1)

                currdate1.setHours(0, 0, 0, 0)
                currdate2.setHours(0, 0, 0, 0)
                currdate2.setDate(currdate1.getDate() + 1)


                let ageing_above_90days = 0;
                let newclients = 0;
                let currentcollection = 0;
                let currentsale_currentyear = 0;
                let lastsale_currentyear = 0;
                let currentsale_last_year = 0;
                let lastsale_lastyear = 0;
                let attendance = await SalesAttendance.findOne({ date: { $gte: currdate1, $lt: currdate2 }, employee: id }).populate('station').populate('employee')
                if (attendance) {
                    //new clients
                    let parttargetcat = await KeyCategory.findOne({ category: 'PartyTarget' })
                    newclients = await ExcelDB.find({ category: parttargetcat, 'STATE NAME': new RegExp(`^${attendance?.station.state}$`, 'i'), 'Create Date': { $gte: currdate1, $lt: currdate2 } }).countDocuments()
                    //bills ageing
                    let billsageingcat = await KeyCategory.findOne({ category: 'BillsAge' })
                    const ageingdocs = await ExcelDB.find({ category: billsageingcat, 'Sales Representative': new RegExp(`^${attendance?.station.state}$`, 'i') })

                    if (ageingdocs && ageingdocs.length > 0) {
                        ageing_above_90days = ageingdocs.reduce((total, doc) => {
                            //@ts-ignore
                            return total + (doc['90-120'] || 0) + (doc['> 120'] || 0);
                        }, 0);
                    }

                    //sale and collection
                    let salrepcat = await KeyCategory.findOne({ category: 'SalesRep' })
                    if (salrepcat) {
                        let currentmonthcurrentyear = new Date()
                        currentmonthcurrentyear.setDate(1)
                        currentmonthcurrentyear.setHours(0, 0, 0, 0)
                        const currentMonthYearSale1 = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Sales', 'Sales Representative': currentmonthcurrentyear })
                        //current year
                        if (currentMonthYearSale1) {
                            //@ts-ignore
                            currentsale_currentyear = currentMonthYearSale1[`${String(attendance?.station.state).toUpperCase()}`]
                            if (!currentsale_currentyear) {
                                //@ts-ignore
                                currentsale_currentyear = currentMonthYearSale1[`${toTitleCase(attendance?.station.state)}`]
                            }

                        }

                        let lastmonthcurrentyear = new Date()
                        lastmonthcurrentyear.setDate(1)
                        lastmonthcurrentyear.setMonth(lastmonthcurrentyear.getMonth() - 1)
                        lastmonthcurrentyear.setHours(0, 0, 0, 0)
                        const currentMonthYearSale2 = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Sales', 'Sales Representative': lastmonthcurrentyear })
                        if (currentMonthYearSale2) {
                            //@ts-ignore
                            lastsale_currentyear = currentMonthYearSale2[`${String(attendance?.station.state).toUpperCase()}`]
                            if (!lastsale_currentyear) {
                                //@ts-ignore
                                lastsale_currentyear = currentMonthYearSale2[`${toTitleCase(attendance?.station.state)}`]
                            }
                        }



                        let currentmonthlastyear = new Date()
                        currentmonthlastyear.setDate(1)
                        currentmonthlastyear.setHours(0, 0, 0, 0)
                        currentmonthlastyear.setFullYear(currentmonthlastyear.getFullYear() - 1)
                        //previous year
                        const lastMonthYearSale1 = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Sales', 'Sales Representative': currentmonthlastyear })
                        if (lastMonthYearSale1) {
                            //@ts-ignore
                            currentsale_last_year = lastMonthYearSale1[`${String(attendance?.station.state).toUpperCase()}`]
                            if (!currentsale_last_year) {
                                //@ts-ignore
                                currentsale_last_year = lastMonthYearSale1[`${toTitleCase(attendance?.station.state)}`]
                            }
                        }


                        let lastmonthlastyear = new Date()
                        lastmonthlastyear.setDate(1)
                        lastmonthlastyear.setMonth(lastmonthlastyear.getMonth() - 1)
                        lastmonthlastyear.setHours(0, 0, 0, 0)
                        lastmonthlastyear.setFullYear(lastmonthlastyear.getFullYear() - 1)
                        const lastMonthYearSale2 = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Sales', 'Sales Representative': lastmonthlastyear })
                        if (lastMonthYearSale2) {
                            //@ts-ignore
                            lastsale_lastyear = lastMonthYearSale2[`${String(attendance?.station.state).toUpperCase()}`]

                            if (!lastsale_lastyear) {
                                //@ts-ignore
                                lastsale_lastyear = lastMonthYearSale2[`${toTitleCase(attendance?.station.state)}`]
                            }
                        }



                        const collectioncurrent = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Collection', 'Sales Representative': currentmonthcurrentyear })
                        if (collectioncurrent) {
                            //@ts-ignore
                            currentcollection = collectioncurrent[`${String(attendance?.station.state).toUpperCase()}`]
                            if (!currentcollection) {
                                //@ts-ignore
                                currentcollection = collectioncurrent[`${toTitleCase(attendance?.station.state)}`]
                            }
                        }
                    }
                }


                let obj: GetSalesmanKpiDto = {
                    employee: { id: user._id, label: user.username, value: user.username },
                    date: moment(currdate1).format("DD/MM/YYYY"),
                    month: moment(currdate1).format("MMMM"),
                    attendance: attendance?.attendance,
                    new_visit: attendance?.new_visit,
                    old_visit: attendance?.old_visit,
                    working_time: (attendance?.in_time || "") + "-" + (attendance?.end_time || ""),
                    new_clients: newclients,
                    station: attendance?.station && { id: attendance?.station._id, label: attendance?.station.city, value: attendance?.station.city },
                    state: attendance?.station.state,
                    currentsale_currentyear: currentsale_currentyear,
                    lastsale_currentyear: lastsale_currentyear,
                    currentsale_last_year: currentsale_last_year,
                    lastsale_lastyear: lastsale_lastyear,
                    current_collection: currentcollection,
                    //@ts-ignore
                    ageing_above_90days: ageing_above_90days,
                    sale_growth: currentsale_currentyear / currentsale_last_year,
                    last_month_sale_growth: lastsale_currentyear / lastsale_lastyear

                }
                result.push(obj)
                current_date.setDate(new Date(current_date).getDate() + 1)
            }
        }

    }
    return res.status(200).json(result)

}



export const GetSalesmanLeavesReport = async (req: Request, res: Response, next: NextFunction) => {
    let result: IColumnRowData = {
        columns: [],
        rows: []
    };
    let rawdata: any[] = []
    let fixedData = await SalesmanLeaves.findOne().sort('-created_at')
    if (req.user.is_admin) {
        rawdata = await SalesmanLeaves.find().sort('-created_at')
    }
    else {
        rawdata.push(fixedData)
        let data = await SalesmanLeaves.find({ 'EMPLOYEE': req.user.username })
        rawdata = rawdata.concat(data)
    }


    let columns = await SalesmanLeavesColumns.find()
    for (let k = 0; k < columns.length; k++) {
        let c = columns[k]
        result.columns.push({ key: c.name, header: c.name, type: "string" })
    }
    for (let k = 0; k < rawdata.length; k++) {
        let obj: IRowData = {}
        let dt = rawdata[k]
        if (dt) {
            for (let i = 0; i < columns.length; i++) {
                if (dt[columns[i].name]) {
                    obj[columns[i].name] = String(dt[columns[i].name])
                }
                else {
                    obj[columns[i].name] = ""
                }
            }
        }
        result.rows.push(obj)
    }

    return res.status(200).json(result)
}

export const CreateSalesmanLeavesFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file)
        return res.status(400).json({
            message: "please provide an Excel file",
        });
    if (req.file) {
        const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
        if (req.file.size > 100 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
        const workbook = xlsx.read(req.file.buffer);
        let workbook_sheet = workbook.SheetNames;
        let workbook_response: any[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        if (workbook_response.length > 3000) {
            return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
        }
        let data = workbook_response[0];
        let keys: string[] = Object.keys(data);
        console.log("keys", keys)
        await SalesmanLeaves.deleteMany({})
        await SalesmanLeavesColumns.deleteMany({})
        for (let i = 0; i < keys.length; i++) {
            await new SalesmanLeavesColumns({ name: keys[i] }).save()
        }

        for (let i = 0; i < workbook_response.length; i++) {
            let checklist = workbook_response[i]
            await new SalesmanLeaves(checklist).save()
        }
    }
    return res.status(200).json({ message: "success" });
}

export const DownloadExcelTemplateForCreateSalesmanLeavesReport = async (req: Request, res: Response, next: NextFunction) => {
    let checklist: any[]=[
        {
            "S NO": "*",
            "EMPLOYEE LEAVE BALANCE": "*",
            "EMPLOYEE": "*"
        }
    ]
    let users = (await User.find()).map((u) => { return { name: u.username } })
    let template: { sheet_name: string, data: any[] }[] = []
    template.push({ sheet_name: 'template', data:checklist })
    template.push({ sheet_name: 'users', data: users })
    ConvertJsonToExcel(template)
    let fileName = "CreateSalesmanLeavesTemplate.xlsx"
    return res.download("./file", fileName)
}



export const GetSalesManVisitReport = async (req: Request, res: Response, next: NextFunction) => {
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
                if (data3[k].customer && checkifNewCustomer(data3[k].customer))
                    newvisit3 = newvisit3 + 1
                else if (data3[k].customer && data3[k].customer.includes('*')) {
                    oldvisit3 = oldvisit3
                    newvisit3 = newvisit3
                }
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
                if (data2[k].customer && checkifNewCustomer(data2[k].customer))
                    newvisit2 = newvisit2 + 1
                else if (data2[k].customer && data2[k].customer.includes('*')) {
                    oldvisit2 = oldvisit2
                    newvisit2 = newvisit2
                }
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
                if (data1[k].customer && checkifNewCustomer(data1[k].customer))
                    newvisit1 = newvisit1 + 1
                else if (data1[k].customer && data1[k].customer.includes('*')) {
                    oldvisit1 = oldvisit1
                    newvisit1 = newvisit1
                }
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


function checkifNewCustomer(customer: string) {
    let isCustomer = false
    let items = ["train", 'hotel', 'election', 'shut', 'travel', 'leave', 'office', 'close', 'sunday', 'home']
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

export const GetSalesAttendancesAutoReport = async (req: Request, res: Response, next: NextFunction) => {
    let id = req.query.id
    let result: GetSalesAttendancesAuto[] = []
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let dt1 = new Date(String(start_date))
    let dt2 = new Date(String(end_date))
    let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []

    if (id == 'all') {
        if (req.user.assigned_users && req.user.assigned_users.length > 0) {
            let salesman = await User.find({ _id: { $in: user_ids }, assigned_permissions: 'sales_menu' })
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
            }
        }
        else {
            let current_date = new Date(dt1)
            while (current_date <= new Date(dt2)) {

                let oldvisit1 = 0
                let newvisit1 = 0
                let worktime1 = ''
                let currdate1 = new Date(current_date)
                let currdate2 = new Date(currdate1)
                currdate1.setHours(0, 0, 0, 0)
                currdate2.setHours(0, 0, 0, 0)
                currdate2.setDate(currdate1.getDate() + 1)

                let data = await VisitReport.find({ employee: req.user, visit_date: { $gte: currdate1, $lt: currdate2 } })
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

                let names = [String(req.user.username), String(req.user.alias1 || ""), String(req.user.alias2 || "")].filter(value => value)
                result.push({
                    employee: {
                        id: req.user._id, label: names.toString(), value: req.user
                            .username
                    },
                    date: moment(current_date).format("DD/MM/YYYY"),
                    old_visit: oldvisit1,
                    new_visit: newvisit1,
                    worktime: worktime1,
                })

                current_date.setDate(new Date(current_date).getDate() + 1)
            }
        }
    }
    else {
        let user = await User.findById(id)
        if (user) {
            let current_date = new Date(dt1)
            while (current_date <= new Date(dt2)) {

                let oldvisit1 = 0
                let newvisit1 = 0
                let worktime1 = ''
                let currdate1 = new Date(current_date)
                let currdate2 = new Date(currdate1)
                currdate1.setHours(0, 0, 0, 0)
                currdate2.setHours(0, 0, 0, 0)
                currdate2.setDate(currdate1.getDate() + 1)

                let data = await VisitReport.find({ employee: user, visit_date: { $gte: currdate1, $lt: currdate2 } })
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

                let names = [String(user.username), String(user.alias1 || ""), String(user.alias2 || "")].filter(value => value)
                result.push({
                    employee: {
                        id: user._id, label: names.toString(), value: user
                            .username
                    },
                    date: moment(current_date).format("DD/MM/YYYY"),
                    old_visit: oldvisit1,
                    new_visit: newvisit1,
                    worktime: worktime1,
                })
                current_date.setDate(new Date(current_date).getDate() + 1)
            }
        }

    }
    return res.status(200).json(result)

}