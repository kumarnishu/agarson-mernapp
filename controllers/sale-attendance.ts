import { NextFunction, Request, Response } from 'express';
import { IUser, User } from '../models/user';
import moment from 'moment';
import { ISalesAttendance, SalesAttendance } from '../models/sales-attendance';
import { CreateOrEditSalesAttendanceDto, GetSalesAttendanceDto, GetSalesmanKpiDto } from '../dtos';
import isMongoId from 'validator/lib/isMongoId';


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
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let id = req.query.id
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let result: GetSalesmanKpiDto[] = []
    let count = 0
    let dt1 = new Date(String(start_date))
    let dt2 = new Date(String(end_date))
    let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []
    let employees=await User.find();
    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        if (id == 'all') {

        }
        else {
            let current_date = new Date(dt1)
            // while (current_date <= new Date(dt2)) {
            //     let obj: GetSalesmanKpiDto = {
            //         employee: DropDownDto,
            //         date: string,
            //         month: string,
            //         attendance: string,
            //         new_visit: number,
            //         old_visit: number,
            //         working_time: string,
            //         new_clients: string,
            //         station: DropDownDto,
            //         state: DropDownDto,
            //         sale_value: number,
            //         collection_value: number,
            //         ageing_above_90days: string,
            //         sale_growth: string,
            //         last_month_sale_current_year: number,
            //         last_month_sale_last_year: number,
            //         current_month_sale_current_year: number,
            //         current_month_sale_last_year: number
            //     }
            //     result.push(obj)
            //     current_date.setDate(new Date(current_date).getDate() + 1)
            // }
        }

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