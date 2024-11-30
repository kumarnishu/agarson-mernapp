import { NextFunction, Request, Response } from 'express';
import { IUser, User } from '../models/user';
import moment from 'moment';
import { ISalesAttendance, SalesAttendance } from '../models/sales-attendance';
import { CreateOrEditSalesAttendanceDto, GetSalesAttendanceDto, GetSalesmanKpiDto } from '../dtos';
import isMongoId from 'validator/lib/isMongoId';
import { ExcelDB } from '../models/excel-db';
import { KeyCategory } from '../models/key-category';


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
                            if (currentMonthYearSale1)
                                //@ts-ignore
                                currentsale_currentyear = currentMonthYearSale1[`${String(attendance?.station.state).toUpperCase()}`]




                            let lastmonthcurrentyear = new Date()
                            lastmonthcurrentyear.setDate(1)
                            lastmonthcurrentyear.setMonth(lastmonthcurrentyear.getMonth()-1)
                            lastmonthcurrentyear.setHours(0, 0, 0, 0)
                            const currentMonthYearSale2 = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Sales', 'Sales Representative': lastmonthcurrentyear })
                            if (currentMonthYearSale2)
                                //@ts-ignore
                                lastsale_currentyear = currentMonthYearSale2[`${String(attendance?.station.state).toUpperCase()}`]



                            let currentmonthlastyear = new Date()
                            currentmonthlastyear.setDate(1)
                            currentmonthlastyear.setHours(0, 0, 0, 0)
                            currentmonthlastyear.setFullYear(currentmonthlastyear.getFullYear()-1)
                            //previous year
                            const lastMonthYearSale1 = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Sales', 'Sales Representative': currentmonthlastyear })
                            if (lastMonthYearSale1)
                                //@ts-ignore
                                currentsale_last_year = lastMonthYearSale1[`${String(attendance?.station.state).toUpperCase()}`]


                            let lastmonthlastyear = new Date()
                            lastmonthlastyear.setDate(1)
                            lastmonthlastyear.setMonth(lastmonthlastyear.getMonth()-1)
                            lastmonthlastyear.setHours(0, 0, 0, 0)
                            lastmonthlastyear.setFullYear(lastmonthlastyear.getFullYear() - 1)
                            const lastMonthYearSale2 = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Sales', 'Sales Representative': lastmonthlastyear })
                            if (lastMonthYearSale2)
                                //@ts-ignore
                                lastsale_lastyear = lastMonthYearSale2[`${String(attendance?.station.state).toUpperCase()}`]



                            const collectioncurrent = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Collection', 'Sales Representative': currentmonthcurrentyear })
                            if (collectioncurrent)
                                //@ts-ignore
                                currentcollection = collectioncurrent[`${String(attendance?.station.state).toUpperCase()}`]
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
                        if (currentMonthYearSale1)
                            //@ts-ignore
                            currentsale_currentyear = currentMonthYearSale1[`${String(attendance?.station.state).toUpperCase()}`]




                        let lastmonthcurrentyear = new Date()
                        lastmonthcurrentyear.setDate(1)
                        lastmonthcurrentyear.setMonth(lastmonthcurrentyear.getMonth() - 1)
                        lastmonthcurrentyear.setHours(0, 0, 0, 0)
                        const currentMonthYearSale2 = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Sales', 'Sales Representative': lastmonthcurrentyear })
                        if (currentMonthYearSale2)
                            //@ts-ignore
                            lastsale_currentyear = currentMonthYearSale2[`${String(attendance?.station.state).toUpperCase()}`]



                        let currentmonthlastyear = new Date()
                        currentmonthlastyear.setDate(1)
                        currentmonthlastyear.setHours(0, 0, 0, 0)
                        currentmonthlastyear.setFullYear(currentmonthlastyear.getFullYear() - 1)
                        //previous year
                        const lastMonthYearSale1 = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Sales', 'Sales Representative': currentmonthlastyear })
                        if (lastMonthYearSale1)
                            //@ts-ignore
                            currentsale_last_year = lastMonthYearSale1[`${String(attendance?.station.state).toUpperCase()}`]


                        let lastmonthlastyear = new Date()
                        lastmonthlastyear.setDate(1)
                        lastmonthlastyear.setMonth(lastmonthlastyear.getMonth() - 1)
                        lastmonthlastyear.setHours(0, 0, 0, 0)
                        lastmonthlastyear.setFullYear(lastmonthlastyear.getFullYear() - 1)
                        const lastMonthYearSale2 = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Sales', 'Sales Representative': lastmonthlastyear })
                        if (lastMonthYearSale2)
                            //@ts-ignore
                            lastsale_lastyear = lastMonthYearSale2[`${String(attendance?.station.state).toUpperCase()}`]



                        const collectioncurrent = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Collection', 'Sales Representative': currentmonthcurrentyear })
                        if (collectioncurrent)
                            //@ts-ignore
                            currentcollection = collectioncurrent[`${String(attendance?.station.state).toUpperCase()}`]
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
                        if (currentMonthYearSale1)
                            //@ts-ignore
                            currentsale_currentyear = currentMonthYearSale1[`${String(attendance?.station.state).toUpperCase()}`]




                        let lastmonthcurrentyear = new Date()
                        lastmonthcurrentyear.setDate(1)
                        lastmonthcurrentyear.setMonth(lastmonthcurrentyear.getMonth() - 1)
                        lastmonthcurrentyear.setHours(0, 0, 0, 0)
                        const currentMonthYearSale2 = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Sales', 'Sales Representative': lastmonthcurrentyear })
                        if (currentMonthYearSale2)
                            //@ts-ignore
                            lastsale_currentyear = currentMonthYearSale2[`${String(attendance?.station.state).toUpperCase()}`]



                        let currentmonthlastyear = new Date()
                        currentmonthlastyear.setDate(1)
                        currentmonthlastyear.setHours(0, 0, 0, 0)
                        currentmonthlastyear.setFullYear(currentmonthlastyear.getFullYear() - 1)
                        //previous year
                        const lastMonthYearSale1 = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Sales', 'Sales Representative': currentmonthlastyear })
                        if (lastMonthYearSale1)
                            //@ts-ignore
                            currentsale_last_year = lastMonthYearSale1[`${String(attendance?.station.state).toUpperCase()}`]


                        let lastmonthlastyear = new Date()
                        lastmonthlastyear.setDate(1)
                        lastmonthlastyear.setMonth(lastmonthlastyear.getMonth() - 1)
                        lastmonthlastyear.setHours(0, 0, 0, 0)
                        lastmonthlastyear.setFullYear(lastmonthlastyear.getFullYear() - 1)
                        const lastMonthYearSale2 = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Sales', 'Sales Representative': lastmonthlastyear })
                        if (lastMonthYearSale2)
                            //@ts-ignore
                            lastsale_lastyear = lastMonthYearSale2[`${String(attendance?.station.state).toUpperCase()}`]



                        const collectioncurrent = await ExcelDB.findOne({ category: salrepcat, 'SALES': 'Collection', 'Sales Representative': currentmonthcurrentyear })
                        if (collectioncurrent)
                            //@ts-ignore
                            currentcollection = collectioncurrent[`${String(attendance?.station.state).toUpperCase()}`]
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