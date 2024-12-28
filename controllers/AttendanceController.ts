import { Response, Request, NextFunction } from "express"
import isMongoId from "validator/lib/isMongoId"
import { ILeaveBalance, LeaveBalance } from "../models/leave-opening.model"
import { CreateOrEditLeaveDto, GetLeaveDto } from "../dtos/leave.dto"

export class AttendanceController {
    //leave aproved controller

    //leave balance controller
    public async GetAllLeaveBalances(req: Request, res: Response, next: NextFunction) {
        let result: GetLeaveDto[] = []
        let items: ILeaveBalance[] = []
        items = await LeaveBalance.find().populate('employee').populate('created_by').populate('updated_by').sort('item')
        result = items.map((item) => {
            return {
                _id: item._id,
                sl: item.sl,
                fl: item.fl,
                sw: item.sw,
                cl: item.cl,
                yearmonth: item.yearmonth,
                employee: { id: item.employee._id, label: item.employee.username },
                created_at: item.created_at,
                updated_at: item.updated_at,
                created_by: { id: item.created_by._id, label: item.created_by.username },
                updated_by: { id: item.updated_by._id, label: item.updated_by.username }
            }
        })
        return res.status(200).json(result)
    }

    public async CreateLeaveBalance(req: Request, res: Response, next: NextFunction) {
        const { sl,
            fl,
            sw,
            cl,
            yearmonth,
            employee } = req.body as CreateOrEditLeaveDto
        if (!yearmonth || !employee) {
            return res.status(400).json({ message: "please provide required fields" })
        }

        if (await LeaveBalance.findOne({ yearmonth: yearmonth, employee: employee }))
            return res.status(400).json({ message: "already exists this item" })
        let result = await new LeaveBalance({
            sl, fl, sw, cl, yearmonth, employee,
            created_at: new Date(),
            created_by: req.user,
            updated_at: new Date(),
            updated_by: req.user
        }).save()
        return res.status(201).json(result)

    }

    public async UpdateLeaveBalance(req: Request, res: Response, next: NextFunction) {
        const { sl,
            fl,
            sw,
            cl,
            yearmonth,
            employee } = req.body as CreateOrEditLeaveDto
        if (!yearmonth || !employee) {
            return res.status(400).json({ message: "please provide required fields" })
        }
        const id = req.params.id
        let olditem = await LeaveBalance.findById(id)
        if (!olditem)
            return res.status(404).json({ message: "item not found" })
        if (yearmonth !== olditem.yearmonth || employee !== olditem.employee._id.valueOf())
            if (await LeaveBalance.findOne({ yearmonth: yearmonth, employee: employee }))
                return res.status(400).json({ message: "already exists this item" })
        await LeaveBalance.findByIdAndUpdate(id, {
            sl,
            fl,
            sw,
            cl,
            yearmonth,
            employee, updated_at: new Date(),
            updated_by: req.user
        })
        return res.status(200).json(olditem)

    }
    public async DeleteLeaveBalance(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "item id not valid" })
        let item = await LeaveBalance.findById(id);
        if (!item) {
            return res.status(404).json({ message: "item not found" })
        }

        await LeaveBalance.findByIdAndDelete(id);

        return res.status(200).json({ message: "item deleted successfully" })
    }
    //attendance report controller
}