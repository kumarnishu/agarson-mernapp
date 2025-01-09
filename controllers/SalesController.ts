import { NextFunction, Request, Response, Router } from 'express';
import moment, { isDate } from 'moment';
import xlsx from "xlsx"
import isMongoId from 'validator/lib/isMongoId';
import { toTitleCase } from '../utils/trimText';
import { GetSalesAttendanceDto, CreateOrEditSalesAttendanceDto, GetSalesmanKpiDto } from '../dtos/sales-attendance.dto';
import { ExcelDB } from '../models/excel-db.model';
import { KeyCategory } from '../models/key-category.model';
import { ISalesAttendance, SalesAttendance } from '../models/sales-attendance.model';
import { IUser, User } from '../models/user.model';
import { GetSalesAttendancesAuto, GetVisitReportDto } from '../dtos/visit-report.dto';
import { VisitReport } from '../models/visit-report.model';
import { decimalToTimeForXlsx } from '../utils/datesHelper';
import { IColumnRowData, IRowData } from "../dtos/table.dto";
import { SalesmanLeaves, SalesmanLeavesColumns } from "../models/salesman-leaves.model";
import ConvertJsonToExcel from "../services/ConvertJsonToExcel";
import { GetSalesManVisitSummaryReportDto } from '../dtos/visit-report.dto';
import { IVisitRemark, VisitRemark } from '../models/visit_remark.model';
import { GetReferenceDto, GetReferenceExcelDto, GetReferenceReportForSalesmanDto } from "../dtos/references.dto";
import { excelSerialToDate, invalidate, parseExcelDate } from "../utils/datesHelper";
import { CRMState, ICRMState } from "../models/crm-state.model";
import { CreateOrEditReferenceRemarkDto, GetReferenceRemarksDto } from '../dtos/references-remark.dto';
import { IReferenceRemark, ReferenceRemark } from '../models/reference-remarks.model';
import { Reference } from '../models/references.model';
import { CreateOrEditVisitSummaryRemarkDto, GetVisitSummaryReportRemarkDto } from '../dtos/visit_remark.dto';
import { CreateOrEditAgeingRemarkDto, GetAgeingDto, GetAgeingExcelDto, GetAgeingRemarkDto, GetCollectionsDto, GetCollectionsExcelDto, GetSalesDto, GetSalesExcelDto } from '../dtos/sales.dto';
import { Sales } from '../models/sales.model';
import { Collection } from '../models/collections.model';
import { Ageing, IAgeing } from '../models/ageing.model';
import { AgeingRemark, IAgeingRemark } from '../models/ageing_remark.model';

export class SalesController {

    public async GetSalesAttendances(req: Request, res: Response, next: NextFunction) {
        let limit = Number(req.query.limit)
        let page = Number(req.query.page)
        let id = req.query.id
        let attendances: ISalesAttendance[] = []
        let result: GetSalesAttendanceDto[] = []
        let count = 0
        let start_date = req.query.start_date
        let end_date = req.query.end_date
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
                    sunday_working: p.is_sunday_working ? 'yes' : '',
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
    public async CreateSalesAttendance(req: Request, res: Response, next: NextFunction) {
        let {
            employee,
            date,
            attendance,
            new_visit,
            old_visit,
            in_time,
            end_time,
            remark,
            is_sunday_working,
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
            is_sunday_working,
            old_visit,
            remark,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()

        return res.status(201).json(att)
    }
    public async UpdateSalesAttendance(req: Request, res: Response, next: NextFunction) {
        let {
            employee,
            date,
            attendance,
            new_visit,
            old_visit,
            in_time,
            end_time,
            remark,
            is_sunday_working,
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
                is_sunday_working,
                end_time,
                new_visit,
                old_visit,
                remark,
                updated_at: new Date(),
                updated_by: req.user
            })
        return res.status(200).json({ message: "attendance updated" })
    }
    public async DeleteSalesAttendance(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id
        if (!id)
            return res.status(400).json({ message: "not a valid request" })
        let attendance = await SalesAttendance.findById(id)
        if (!attendance)
            return res.status(404).json({ message: "attendance not exists" })

        await SalesAttendance.findByIdAndDelete(attendance._id)
        return res.status(200).json({ message: "attendance removed" })
    }

    public async GetSalesManKpi(req: Request, res: Response, next: NextFunction) {
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
                            employee: { id: salesman[i]._id, label: salesman[i].username },
                            date: moment(currdate1).format("DD/MM/YYYY"),
                            month: moment(currdate1).format("MMMM"),
                            attendance: attendance?.attendance,
                            new_visit: attendance?.new_visit,
                            old_visit: attendance?.old_visit,
                            working_time: (attendance?.in_time || "") + "-" + (attendance?.end_time || ""),
                            new_clients: newclients,
                            station: attendance?.station && { id: attendance?.station._id, label: attendance?.station.city },
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
                }
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
                        employee: { id: req.user, label: req.user.username },
                        date: moment(currdate1).format("DD/MM/YYYY"),
                        month: moment(currdate1).format("MMMM"),
                        attendance: attendance?.attendance,
                        new_visit: attendance?.new_visit,
                        old_visit: attendance?.old_visit,
                        working_time: (attendance?.in_time || "") + "-" + (attendance?.end_time || ""),
                        new_clients: newclients,
                        station: attendance?.station && { id: attendance?.station._id, label: attendance?.station.city },
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
                        employee: { id: user._id, label: user.username },
                        date: moment(currdate1).format("DD/MM/YYYY"),
                        month: moment(currdate1).format("MMMM"),
                        attendance: attendance?.attendance,
                        new_visit: attendance?.new_visit,
                        old_visit: attendance?.old_visit,
                        working_time: (attendance?.in_time || "") + "-" + (attendance?.end_time || ""),
                        new_clients: newclients,
                        station: attendance?.station && { id: attendance?.station._id, label: attendance?.station.city },
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

    public async GetSalesAttendancesAutoReport(req: Request, res: Response, next: NextFunction) {
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
                                if (data[k].customer && SalesController.checkifNewCustomer(data[k].customer))
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
                                id: salesman[i]._id, label: names.toString()
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
                            if (data[k].customer && SalesController.checkifNewCustomer(data[k].customer))
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
                            id: req.user._id, label: names.toString()
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
                            if (data[k].customer && SalesController.checkifNewCustomer(data[k].customer))
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
                            id: user._id, label: names.toString()
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
    static checkifNewCustomer(customer: string) {
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
    public async GetSalesmanLeavesReport(req: Request, res: Response, next: NextFunction) {
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

    public async CreateSalesmanLeavesFromExcel(req: Request, res: Response, next: NextFunction) {
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

    public async DownloadExcelTemplateForCreateSalesmanLeavesReport(req: Request, res: Response, next: NextFunction) {
        let checklist: any[] = [
            {
                "S NO": "*",
                "EMPLOYEE LEAVE BALANCE": "*",
                "EMPLOYEE": "*"
            }
        ]
        let users = (await User.find()).map((u) => { return { name: u.username } })
        let template: { sheet_name: string, data: any[] }[] = []
        template.push({ sheet_name: 'template', data: checklist })
        template.push({ sheet_name: 'users', data: users })
        ConvertJsonToExcel(template)
        let fileName = "CreateSalesmanLeavesTemplate.xlsx"
        return res.download("./file", fileName)
    }
    public async GetSalesManVisitReport(req: Request, res: Response, next: NextFunction) {
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
                    id: salesman[i]._id, label: names.toString()
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
    public async GetVisitReports(req: Request, res: Response, next: NextFunction) {
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
    public async GetReferencesReport(req: Request, res: Response, next: NextFunction) {
        try {
            // Step 1: Aggregate data to calculate total_sale_scope and gather party details
            let hidden = req.query.hidden

            const data = await Reference.aggregate([
                {
                    $group: {
                        _id: { gst: "$gst", reference: "$reference" },
                        total_sale_scope: { $sum: "$sale_scope" },
                        party: { $first: "$party" },
                        address: { $first: "$address" },
                        state: { $first: "$state" },
                        pincode: { $first: "$pincode" },
                        business: { $first: "$business" },
                        last_remark: { $first: "$last_remark" },
                        next_call: { $first: "$next_call" },
                        stage: { $first: "$stage" }
                    },
                },
                ...(hidden === 'true' ? [{
                    $match: {
                        total_sale_scope: { $lt: 50000 }
                    }
                }] : [{
                    $match: {
                        total_sale_scope: { $gte: 50000 }
                    }
                }]),
                {
                    $project: {
                        _id: 0,
                        gst: "$_id.gst",
                        reference: "$_id.reference",
                        total_sale_scope: 1,
                        party: 1,
                        address: 1,
                        state: 1,
                        stage: 1,
                        pincode: 1,
                        business: 1,
                        last_remark: 1,
                        next_call: 1
                    },
                },
            ]);

            // Step 2: Reshape the aggregated result to pivot references into separate columns
            const pivotResult: any = {};

            data.forEach((item) => {
                const { party, reference, total_sale_scope, stage, gst, address, last_remark, next_call, state, pincode, business } = item;

                // Initialize row for each party
                if (!pivotResult[party]) {
                    pivotResult[party] = {
                        party,
                        gst,
                        address,
                        state,
                        stage: stage ? stage : "open",
                        pincode,
                        business,
                        last_remark,
                        next_call: next_call ? moment(next_call).format("DD/MM/YYYY") : ""
                    };
                }

                // Add dynamic reference column
                pivotResult[party][reference] = Math.round((total_sale_scope / 1000) - 0.1);
            });

            // Step 3: Convert pivotResult object into an array
            const finalResult: GetReferenceDto[] = Object.values(pivotResult);

            return res.status(200).json(finalResult);
        } catch (error: any) {
            console.error("Error generating references report:", error);
            return res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    };

    public async GetReferencesReportForSalesman(req: Request, res: Response, next: NextFunction) {
        let assigned_states: string[] = []
        let user = await User.findById(req.user._id).populate('assigned_crm_states')
        user && user?.assigned_crm_states.map((state: ICRMState) => {
            assigned_states.push(state.state)
            if (state.alias1)
                assigned_states.push(state.alias1)
            if (state.alias2)
                assigned_states.push(state.alias2)
        });
        const data = await Reference.aggregate([
            {
                $match: {
                    state: { $in: assigned_states },

                    // Filter documents where the lowercase state is 'haryana'
                }
            },
            {
                $group: {
                    _id: { gst: "$gst", reference: "$reference" },
                    total_sale_scope: { $sum: "$sale_scope" },
                    party: { $first: "$party" },
                    address: { $first: "$address" },
                    state: { $first: "$state" },
                    pincode: { $first: "$pincode" },
                    business: { $first: "$business" },
                    last_remark: { $first: "$last_remark" },
                    next_call: { $first: "$next_call" },
                    stage: { $first: "$stage" }
                },
            },
            {
                $match: {
                    total_sale_scope: { $gte: 50000 }
                }
            },
            {
                $project: {
                    _id: 0,
                    gst: "$_id.gst",
                    party: "$party",
                    reference: "$_id.reference",
                    total_sale_scope: 1,
                    address: 1,
                    state: 1,
                    stage: 1,
                    last_remark: 1,
                },
            },
        ]);

        // Step 2: Reshape the aggregated result to pivot references into separate columns
        const pivotResult: any = {};

        data.forEach((item) => {
            const { party, stage, address, state, gst, last_remark, total_sale_scope } = item;

            // Initialize row for each party
            if (!pivotResult[party] && item.total_sale_scope >= 50) {
                pivotResult[party] = {
                    party,
                    address,
                    gst,
                    state,
                    stage: stage ? stage : "open",
                    last_remark,
                };
            }
        });

        // Step 3: Convert pivotResult object into an array
        const finalResult: GetReferenceReportForSalesmanDto[] = Object.values(pivotResult);

        return res.status(200).json(finalResult);

    }
    public async EditReferenceState(req: Request, res: Response, next: NextFunction) {
        const { gst, state } = req.body as { gst: string, state: string }
        if (!gst || !state)
            return res.status(400).json({ message: "fill all required fields" })
        await Reference.updateMany({ gst: gst }, { state: state })
        return res.status(200).json({ message: "success" })
    }

    public async BulkCreateAndUpdateReferenceFromExcel(req: Request, res: Response, next: NextFunction) {
        let result: GetReferenceExcelDto[] = []
        let validated = true
        let statusText: string = ""
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
            let workbook_response: GetReferenceExcelDto[] = xlsx.utils.sheet_to_json(
                workbook.Sheets[workbook_sheet[0]]
            );
            if (workbook_response.length > 3000) {
                return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
            }

            for (let i = 0; i < workbook_response.length; i++) {
                let item = workbook_response[i]
                let date: string | null = item.date
                let gst: string | null = item.gst
                let party: string | null = item.party
                let address: string | null = item.address
                let state: string | null = item.state
                let pincode: number | null = item.pincode
                let business: string | null = item.business
                let sale_scope: number | null = item.sale_scope
                let reference: string | null = item.reference || "Default"
                if (!date) {
                    validated = false
                    statusText = "required date"
                }
                let nedate = new Date(excelSerialToDate(date)) > invalidate ? new Date(excelSerialToDate(date)) : parseExcelDate(date)
                if (!isDate(nedate)) {
                    validated = false
                    statusText = "invalid date"
                }
                if (!party) {
                    validated = false
                    statusText = "party required"
                }

                if (!reference) {
                    validated = false
                    statusText = "reference required"
                }

                if (validated) {
                    if (item._id && isMongoId(String(item._id))) {
                        let tmpitem = await Reference.findById(item._id).sort('-date')

                        if (tmpitem) {
                            await Reference.findByIdAndUpdate(item._id, {
                                date: nedate,
                                gst: gst,
                                address: address,
                                state: item.state.toLowerCase(),
                                pincode: pincode,
                                business: business,
                                party: item.party.toLowerCase(),
                                sale_scope: sale_scope,
                                reference: item.reference.toLowerCase(),
                                updated_by: req.user,
                                updated_at: new Date()
                            })
                            statusText = "updated"
                        }

                        else {
                            console.log(item._id, "not found")
                            statusText = "not found"
                        }

                    }

                    if (!item._id || !isMongoId(String(item._id))) {
                        let oldref = await Reference.findOne({ party: party.toLowerCase(), reference: item.reference.toLowerCase(), date: nedate, sale_scope: sale_scope })
                        if (!oldref) {
                            await new Reference({
                                date: nedate,
                                gst: gst,
                                party: party.toLowerCase(),
                                address: address,
                                state: state.toLowerCase(),
                                pincode: pincode,
                                business: business,
                                sale_scope: sale_scope,
                                reference: reference.toLowerCase(),
                                created_by: req.user,
                                updated_by: req.user,
                                created_at: new Date(),
                                updated_at: new Date()
                            }).save()
                            statusText = "created"
                        }
                        else
                            statusText = "duplicate"
                    }

                }

                result.push({
                    ...item,
                    status: statusText
                })
            }


        }
        return res.status(200).json(result);
    }

    public async DownloadExcelTemplateForCreateReferenceReport(req: Request, res: Response, next: NextFunction) {
        let checklist: any[] = [
            {
                _id: 'wwwewew',
                date: '01-12-2024',
                gst: '22AAAAA0000A15',
                party: 'sunrise traders',
                address: 'mumbai maharashtra',
                state: 'maharashtra',
                pincode: 120914,
                business: 'safety',
                sale_scope: 900000,
                reference: 'A'
            }
        ]
        // const data = await Reference.aggregate(
        //     [
        //         {
        //             $group: {
        //                 _id: { reference: "$reference", party: "$party", date: "$date" }, // Group by reference, party, and date
        //                 id: { $first: "$_id" },
        //                 total_sale_scope: { $sum: "$sale_scope" }, // Summing sale_scope for each group
        //                 gst: { $first: "$gst" }, // Assuming same GST for each group
        //                 address: { $first: "$address" }, // Assuming same address for each group
        //                 state: { $first: "$state" }, // Assuming same state for each group
        //                 pincode: { $first: "$pincode" }, // Assuming same pincode for each group
        //                 business: { $first: "$business" }, // Assuming same business for each group
        //             }
        //         },
        //         {
        //             $project: {
        //                 _id: 0,
        //                 id: "$id",
        //                 reference: "$_id.reference",
        //                 party: "$_id.party",
        //                 date: "$_id.date",
        //                 total_sale_scope: 1,
        //                 gst: 1,
        //                 address: 1,
        //                 state: 1,
        //                 pincode: 1,
        //                 business: 1
        //             }
        //         }
        //     ]
        // )


        // if (data.length > 0)
        //     checklist = data.map((ref) => {
        //         return {
        //             _id: ref.id,
        //             gst: ref.gst,
        //             party: ref.party,
        //             address: ref.address,
        //             state: ref.state,
        //             pincode: ref.pincode,
        //             business: ref.business,
        //             sale_scope: ref.total_sale_scope,
        //             reference: ref.reference
        //         }
        //     })
        let template: { sheet_name: string, data: any[] }[] = []
        template.push({ sheet_name: 'template', data: checklist })
        ConvertJsonToExcel(template)
        let fileName = "CreateReferenceTemplate.xlsx"
        return res.download("./file", fileName)
    }

    public async UpdateReferenceRemark(req: Request, res: Response, next: NextFunction) {
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

    public async DeleteReferenceRemark(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
        let rremark = await ReferenceRemark.findById(id)
        if (!rremark) {
            return res.status(404).json({ message: "remark not found" })
        }
        await rremark.remove()
        return res.status(200).json({ message: " remark deleted successfully" })
    }
    public async GetReferenceRemarkHistory(req: Request, res: Response, next: NextFunction) {
        const party = req.query.party
        let remarks: IReferenceRemark[] = []
        let result: GetReferenceRemarksDto[] = []
        remarks = await ReferenceRemark.find({ party: String(party).trim().toLowerCase() }).populate('created_by').sort('-created_at')

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

    public async NewReferenceRemark(req: Request, res: Response, next: NextFunction) {
        const {
            remark,
            party,
            next_date, stage } = req.body as CreateOrEditReferenceRemarkDto
        if (!remark || !party) return res.status(403).json({ message: "please fill required fields" })

        console.log(stage)

        let new_remark = new ReferenceRemark({
            remark,
            party: party.trim().toLowerCase(),
            created_at: new Date(Date.now()),
            created_by: req.user,
            updated_at: new Date(Date.now()),
            updated_by: req.user
        })
        if (next_date) {
            new_remark.next_call = new Date(next_date)
        }
        if (stage && next_date) {
            await Reference.updateMany({ party: party }, { stage: stage, next_call: new Date(next_date), last_remark: remark })
        }
        else if (stage) {
            await Reference.updateMany({ party: party }, { stage: stage, last_remark: remark })
        }
        await new_remark.save()
        return res.status(200).json({ message: "remark added successfully" })
    }
    public async NewVisitRemark(req: Request, res: Response, next: NextFunction) {
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
    public async UpdateVisitRemark(req: Request, res: Response, next: NextFunction) {
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

    public async DeleteVisitRemark(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
        let rremark = await VisitRemark.findById(id)
        if (!rremark) {
            return res.status(404).json({ message: "remark not found" })
        }
        await rremark.remove()
        return res.status(200).json({ message: " remark deleted successfully" })
    }

    public async GetVisitSummaryReportRemarkHistory(req: Request, res: Response, next: NextFunction) {
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



    public async GetSalesReport(req: Request, res: Response, next: NextFunction) {
        let assigned_states: string[] = []
        let result: GetSalesDto[] = []
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let dt1 = new Date(String(start_date))
        let dt2 = new Date(String(end_date))
        dt1.setHours(0, 0, 0, 0)
        dt2.setHours(0, 0, 0, 0)
        let user = await User.findById(req.user._id).populate('assigned_crm_states')
        user && user?.assigned_crm_states.map((state: ICRMState) => {
            assigned_states.push(state.state)
            if (state.alias1)
                assigned_states.push(state.alias1)
            if (state.alias2)
                assigned_states.push(state.alias2)
        });
        let data = await Sales.find({ date: { $gte: dt1, $lt: dt2 }, state: { $in: assigned_states } }).sort('-date');
        result = data.map((dt) => {
            return {
                _id: dt._id,
                date: moment(dt.date).format("YYYY-MM-DD"),
                month: moment(dt.date).format('MMMM'),
                invoice_no: dt.invoice_no,
                party: dt.party,
                state: dt.state,
                amount: dt.amount
            }
        })
        return res.status(200).json(result);

    }
    public async BulkCreateAndUpdateSalesFromExcel(req: Request, res: Response, next: NextFunction) {
        let result: GetSalesExcelDto[] = []
        let validated = true
        let statusText: string = ""
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
            let workbook_response: GetSalesExcelDto[] = xlsx.utils.sheet_to_json(
                workbook.Sheets[workbook_sheet[0]]
            );
            if (workbook_response.length > 3000) {
                return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
            }

            for (let i = 0; i < workbook_response.length; i++) {
                let item = workbook_response[i];
                let { _id, date, invoice_no, party, state, amount } = item;

                let validated = true;
                let statusText = "";

                if (!date) {
                    validated = false;
                    statusText = "required date";
                }

                let nedate = new Date(excelSerialToDate(date)) > invalidate ? new Date(excelSerialToDate(date)) : parseExcelDate(date);
                if (!isDate(nedate)) {
                    validated = false;
                    statusText = "invalid date";
                }

                if (!party) {
                    validated = false;
                    statusText = "party required";
                }

                if (!state) {
                    validated = false;
                    statusText = "state required";
                }

                let normalizedInvoiceNo = String(invoice_no).trim().toLowerCase() || null;
                if (!normalizedInvoiceNo) {
                    validated = false;
                    statusText = "invoice no required";
                }

                if (!_id && await Sales.findOne({ invoice_no: normalizedInvoiceNo })) {
                    validated = false;
                    statusText = "invoice no duplicate";
                }

                if (_id) {
                    let sale = await Sales.findById(_id);
                    if (sale && sale.invoice_no !== normalizedInvoiceNo) {
                        let duplicateSale = await Sales.findOne({ invoice_no: normalizedInvoiceNo });
                        if (duplicateSale) {
                            validated = false;
                            statusText = "invoice no duplicate";
                        }
                    }
                }

                if (validated) {
                    if (_id && isMongoId(_id)) {
                        await Sales.findByIdAndUpdate(_id, {
                            date: nedate,
                            invoice_no: normalizedInvoiceNo,
                            state,
                            party,
                            amount,
                            updated_by: req.user,
                            updated_at: new Date(),
                        });
                        statusText = "updated";
                    }
                    else {
                        await new Sales({
                            date: nedate,
                            invoice_no: normalizedInvoiceNo,
                            state,
                            party,
                            amount,
                            created_by: req.user,
                            updated_by: req.user,
                            created_at: new Date(),
                            updated_at: new Date(),
                        }).save();
                        statusText = "created";
                    }
                }

                result.push({
                    ...item,
                    status: statusText,
                });
            }

        }
        return res.status(200).json(result);
    }

    public async DownloadExcelTemplateForCreateSalesReport(req: Request, res: Response, next: NextFunction) {
        let checklist: GetSalesExcelDto[] = [
            {
                _id: 'wwwewew',
                date: '01-12-2024',
                party: 'sunrise traders',
                state: 'maharashtra',
                amount: 120914,
                invoice_no: '202/45'
            }
        ]

        let template: { sheet_name: string, data: any[] }[] = []
        template.push({ sheet_name: 'template', data: checklist })
        ConvertJsonToExcel(template)
        let fileName = "CreateSalesTemplate.xlsx"
        return res.download("./file", fileName)
    }

    public async GetCollectionReport(req: Request, res: Response, next: NextFunction) {
        let assigned_states: string[] = []
        let result: GetCollectionsDto[] = []
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let dt1 = new Date(String(start_date))
        let dt2 = new Date(String(end_date))
        dt1.setHours(0, 0, 0, 0)
        dt2.setHours(0, 0, 0, 0)
        let user = await User.findById(req.user._id).populate('assigned_crm_states')
        user && user?.assigned_crm_states.map((state: ICRMState) => {
            assigned_states.push(state.state)
            if (state.alias1)
                assigned_states.push(state.alias1)
            if (state.alias2)
                assigned_states.push(state.alias2)
        });
        let data = await Collection.find({ date: { $gte: dt1, $lte: dt2 }, state: { $in: assigned_states } }).sort('-date');
        result = data.map((dt) => {
            return {
                _id: dt._id,
                date: moment(dt.date).format("YYYY-MM-DD"),
                party: dt.party,
                month: moment(dt.date).format('MMMM'),
                state: dt.state,
                amount: dt.amount
            }
        })
        return res.status(200).json(result);

    }
    public async BulkCreateAndUpdateCollectionsFromExcel(req: Request, res: Response, next: NextFunction) {
        let result: GetCollectionsExcelDto[] = []
        let validated = true
        let statusText: string = ""
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
            let workbook_response: GetCollectionsExcelDto[] = xlsx.utils.sheet_to_json(
                workbook.Sheets[workbook_sheet[0]]
            );
            if (workbook_response.length > 3000) {
                return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
            }

            for (let i = 0; i < workbook_response.length; i++) {
                let item = workbook_response[i]
                let _id: string | null = item._id
                let date: string | null = item.date
                let party: string | null = item.party
                let state: string | null = item.state
                let amount: number | null = item.amount

                if (!date) {
                    validated = false
                    statusText = "required date"
                }
                let nedate = new Date(excelSerialToDate(date)) > invalidate ? new Date(excelSerialToDate(date)) : parseExcelDate(date)
                if (!isDate(nedate)) {
                    validated = false
                    statusText = "invalid date"
                }
                if (!party) {
                    validated = false
                    statusText = "party required"
                }
                if (!state) {
                    validated = false
                    statusText = "state required"
                }
                if (!_id && await Collection.findOne({ date: nedate, party: party.trim().toLowerCase(), amount: amount })) {
                    validated = false
                    statusText = "collection exists"
                }

                if (validated) {
                    if (item._id && isMongoId(String(item._id))) {

                        await Collection.findByIdAndUpdate(item._id, {
                            // date: nedate,
                            // state: state,
                            // party: party,
                            amount: amount,
                            updated_by: req.user,
                            updated_at: new Date()
                        })
                        statusText = "updated amount only"
                    }

                    else {
                        console.log(item._id, "not found")
                        statusText = "not found"
                    }

                }

                if (!item._id || !isMongoId(String(item._id))) {
                    await new Collection({
                        date: nedate,
                        state: state,
                        party: party,
                        amount: amount,
                        created_by: req.user,
                        updated_by: req.user,
                        created_at: new Date(),
                        updated_at: new Date()
                    }).save()
                    statusText = "created"
                }

                result.push({
                    ...item,
                    status: statusText
                })
            }


        }
        return res.status(200).json(result);
    }

    public async DownloadExcelTemplateForCreateCollectionsReport(req: Request, res: Response, next: NextFunction) {
        let checklist: GetCollectionsExcelDto[] = [
            {
                _id: 'wwwewew',
                date: '01-12-2024',
                party: 'sunrise traders',
                state: 'maharashtra',
                amount: 120914
            }
        ]

        let template: { sheet_name: string, data: any[] }[] = []
        let states = (await CRMState.find()).map((u) => { return { state: u.state } })
        template.push({ sheet_name: 'states', data: states })
        template.push({ sheet_name: 'template', data: checklist })
        ConvertJsonToExcel(template)
        let fileName = "CreateCollectionTemplate.xlsx"
        return res.download("./file", fileName)
    }


    public async GetAgeingReport(req: Request, res: Response, next: NextFunction) {
        let assigned_states: string[] = []
        let result: GetAgeingDto[] = []
        let hidden = req.query.hidden
        let user = await User.findById(req.user._id).populate('assigned_crm_states')
        user && user?.assigned_crm_states.map((state: ICRMState) => {
            assigned_states.push(state.state)
            if (state.alias1)
                assigned_states.push(state.alias1)
            if (state.alias2)
                assigned_states.push(state.alias2)
        });
        let dt1 = new Date()
        dt1.setDate(dt1.getDate() + 1)
        dt1.setHours(0, 0, 0, 0)
        let data: IAgeing[] = await Ageing.find({ state: { $in: assigned_states } }).sort('-created_at');

        await Promise.all(data.map(async (dt) => {
            let remark = await AgeingRemark.findOne({ party: dt.party }).sort('-created_at')
            let push_row = true

            if (hidden && hidden !== 'true' && remark && remark.next_call > dt1) {
                if (remark.created_by == req.user._id.valueOf())
                    push_row = false
            }

            if (push_row)
                result.push({
                    _id: dt._id,
                    party: dt.party,
                    state: dt.state,
                    last_remark: remark ? remark.remark : "",
                    next_call: remark?.next_call ? moment(remark.next_call).format("YYYY-MM-DD") : "",
                    two5: dt.two5,
                    three0: dt.three0,
                    five5: dt.five5,
                    six0: dt.six0,
                    seven0: dt.seven0,
                    seventyplus: dt.seventyplus,
                })
        }))

        return res.status(200).json(result);

    }

    public async BulkCreateAndUpdateAgeingFromExcel(req: Request, res: Response, next: NextFunction) {
        let result: GetAgeingExcelDto[] = []
        let validated = true
        let statusText: string = ""
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
            let workbook_response: GetAgeingExcelDto[] = xlsx.utils.sheet_to_json(
                workbook.Sheets[workbook_sheet[0]]
            );
            if (workbook_response.length > 3000) {
                return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
            }
            await Ageing.deleteMany({})
            for (let i = 0; i < workbook_response.length; i++) {
                let item = workbook_response[i]
                let _id: string | null = item._id
                let party: string | null = item.party
                let state: string | null = item.state
                let two5: number | null = item.two5
                let three0: number | null = item.three0
                let five5: number | null = item.five5
                let six0: number | null = item.six0
                let seven0: number | null = item.seven0
                let seventyplus: number | null = item.seventyplus
                if (validated) {
                    if (item._id && isMongoId(String(item._id))) {

                        await Ageing.findByIdAndUpdate(item._id, {
                            state: item.state || "unknown",
                            party: party || "NA",
                            two5: two5,
                            three0: three0,
                            five5: five5,
                            six0: six0,
                            seven0: seven0,
                            seventyplus: seventyplus,
                            updated_by: req.user,
                            updated_at: new Date()
                        })
                        statusText = "updated "
                    }

                    if (!item._id || !isMongoId(String(item._id))) {
                        await new Ageing({
                            state: item.state || "unknown",
                            party: party || "NA",
                            two5: two5,
                            three0: three0,
                            five5: five5,
                            six0: six0,
                            seven0: seven0,
                            seventyplus: seventyplus,
                            created_by: req.user,
                            updated_by: req.user,
                            created_at: new Date(),
                            updated_at: new Date()
                        }).save()
                        statusText = "created"
                    }

                }



                result.push({
                    ...item,
                    status: statusText
                })
            }


        }
        return res.status(200).json(result);
    }

    public async DownloadExcelTemplateForCreateAgeingReport(req: Request, res: Response, next: NextFunction) {
        let checklist: GetAgeingExcelDto[] = [
            {
                _id: 'sdswdw',
                state: "maharashtra",
                party: 'abc footwaer',
                two5: 0,
                three0: 0,
                five5: 0,
                six0: 0,
                seven0: 0,
                seventyplus: 0,
            }
        ]

        let template: { sheet_name: string, data: any[] }[] = []
        template.push({ sheet_name: 'template', data: checklist })
        ConvertJsonToExcel(template)
        let fileName = "CreateAgeingTemplate.xlsx"
        return res.download("./file", fileName)
    }

    public async NewAgeingRemark(req: Request, res: Response, next: NextFunction) {
        const { remark, party, nextcall } = req.body as CreateOrEditAgeingRemarkDto
        if (!remark || !party) return res.status(403).json({ message: "please fill required fields" })

        await new AgeingRemark({
            remark,
            party,
            next_call: nextcall ? new Date(nextcall) : undefined,
            created_at: new Date(Date.now()),
            created_by: req.user,
            updated_at: new Date(Date.now()),
            updated_by: req.user
        }).save()
        return res.status(200).json({ message: "remark added successfully" })
    }
    public async UpdateAgeingRemark(req: Request, res: Response, next: NextFunction) {
        const { remark, nextcall } = req.body as CreateOrEditAgeingRemarkDto
        if (!remark) return res.status(403).json({ message: "please fill required fields" })

        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
        let rremark = await AgeingRemark.findById(id)
        if (!rremark) {
            return res.status(404).json({ message: "remark not found" })
        }
        rremark.remark = remark
        if (nextcall)
            rremark.next_call = new Date(nextcall)
        await rremark.save()
        return res.status(200).json({ message: "remark updated successfully" })
    }

    public async DeleteAgeingRemark(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
        let rremark = await AgeingRemark.findById(id)
        if (!rremark) {
            return res.status(404).json({ message: "remark not found" })
        }
        await rremark.remove()
        return res.status(200).json({ message: " remark deleted successfully" })
    }

    public async GetAgeingRemarkHistory(req: Request, res: Response, next: NextFunction) {
        const party = req.query.party;
        if (!party) return res.status(403).json({ message: "please fill required fields" })
        let remarks: IAgeingRemark[] = []


        let result: GetAgeingRemarkDto[] = []
        remarks = await AgeingRemark.find({ party: party }).populate('created_by').sort('-created_at')
        result = remarks.map((r) => {
            return {
                _id: r._id,
                remark: r.remark,
                party: r.party,
                nextcall: r.next_call ? r.next_call.toString() : "",
                created_at: r.created_at.toString(),
                created_by: r.created_by.username
            }
        })
        return res.json(result)
    }
}