import { Response, Request, NextFunction } from "express"
import moment from "moment"
import isMongoId from "validator/lib/isMongoId"
import { GetLeaveDto, ApplyLeaveDtoFromAdmin, GetLeaveBalanceDto, CreateOrEditLeaveBalanceDto } from "../dtos/AttendanceDto"
import { ILeave } from "../interfaces/AttendanceInterface"
import { ILeaveBalance } from "../interfaces/SalesInterface"
import { Asset, IUser } from "../interfaces/UserController"
import { Leave, SalesAttendance } from "../models/AttendanceModel"
import { LeaveBalance } from "../models/SalesModel"
import { User } from "../models/UserModel"
import { uploadFileToCloud } from "../services/uploadFileToCloud"

export class AttendanceController {

    //leave approved controller
    public async GetAllLeaves(req: Request, res: Response, next: NextFunction) {
        let result: GetLeaveDto[] = []
        let items: ILeave[] = []
        let status = req.query.status
        let filter: { status?: string } | {} = {}
        if (status !== 'all')
            filter = { status: status }
        if (req.user.is_admin) {
            items = await Leave.find(filter).populate('employee').populate('created_by').populate('updated_by').sort('-created_at')
        }
        else
            items = await Leave.find({ $and: [filter, { employee: req.user._id }] }).populate('employee').populate('created_by').populate('updated_by').sort('-created_at')

        result = items.map((item) => {
            return {
                _id: item._id,
                leave_type: item.leave_type,
                status: item.status,
                photo: item.photo ? item.photo.public_url : '',
                leave: item.leave,
                yearmonth: item.yearmonth,
                employee: { id: item.employee._id, label: item.employee.username },
                created_at: moment(item.created_at).format('YYYY-MM-DD'),
                updated_at: moment(item.updated_at).format('YYYY-MM-DD'),
                created_by: { id: item.created_by._id, label: item.created_by.username },
                updated_by: { id: item.updated_by._id, label: item.updated_by.username }
            }
        })
        return res.status(200).json(result)
    }
    public async GetLeavesPendingForApprovalCount(req: Request, res: Response, next: NextFunction) {
        let count = 0
        if (req.user.is_admin) {
            count = await Leave.countDocuments({ status: 'pending' })
        }
        else
            count = await Leave.countDocuments({ $and: [{ status: 'pending' }, { employee: req.user._id }] })

        return res.status(200).json(count)
    }

    public async ApplyLeave(req: Request, res: Response, next: NextFunction) {
        let body = JSON.parse(req.body.body)
        const { leave_type, leave, yearmonth, employee } = body as { leave_type: string, leave: number, yearmonth: number, employee: string }
        if (!leave_type || !leave || !yearmonth || !employee) {
            return res.status(400).json({ message: "please provide required fields" })
        }
        console.log(body)
        if (!req.file)
            return res.status(400).json({ message: "please provide required fields" })
        let document: Asset = undefined
        if (req.file) {
            const allowedFiles = ["image/png", "image/jpeg", "image/gif", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/pdf"];
            const storageLocation = `leaves/media`;
            if (!allowedFiles.includes(req.file.mimetype))
                return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
            if (req.file.size > 20 * 1024 * 1024)
                return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
            const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
            if (doc)
                document = doc
            else {
                return res.status(500).json({ message: "file uploading error" })
            }
        }
        await new Leave({
            leave_type, leave, yearmonth, employee, photo: document,
            status: 'pending',
            created_at: new Date(),
            created_by: req.user,
            updated_at: new Date(),
            updated_by: req.user
        }).save()
        return res.status(201).json({ message: "success" })
    }

    public async ApplyLeaveFromAdmin(req: Request, res: Response, next: NextFunction) {
        const { leave_type, leave, status, yearmonth, employee } = req.body as ApplyLeaveDtoFromAdmin
        if (!leave_type || !leave || !yearmonth || !status || !employee) {
            return res.status(400).json({ message: "please provide required fields" })
        }
        await new Leave({
            leave_type, leave, yearmonth, employee,
            status: status,
            created_at: new Date(),
            created_by: req.user,
            updated_at: new Date(),
            updated_by: req.user
        }).save()
        return res.status(201).json({ message: "success" })
    }

    public async ApproveOrRejectLeave(req: Request, res: Response, next: NextFunction) {
        const { status } = req.body as { status: string }
        if (!status) {
            return res.status(400).json({ message: "please provide required fields" })
        }
        const id = req.params.id
        let leave = await Leave.findById(id)
        if (!leave)
            return res.status(404).json({ message: "item not found" })
        leave.status = status
        await leave.save()
        return res.status(200).json({ message: "success" })

    }
    //leave balance controller
    public async GetAllLeaveBalances(req: Request, res: Response, next: NextFunction) {
        let result: GetLeaveBalanceDto[] = []
        let items: ILeaveBalance[] = []
        if (req.user.is_admin)
            items = await LeaveBalance.find().populate('employee').populate('created_by').populate('updated_by').sort('item')
        else
            items = await LeaveBalance.find({ employee: req.user._id }).populate('employee').populate('created_by').populate('updated_by').sort('item')
        result = items.map((item) => {
            return {
                _id: item._id,
                sl: item.sl,
                fl: item.fl,
                sw: item.sw,
                cl: item.cl,
                yearmonth: item.yearmonth,
                employee: { id: item.employee._id, label: item.employee.username },
                created_at: moment(item.created_at).format('YYYY-MM-DD'),
                updated_at: moment(item.updated_at).format('YYYY-MM-DD'),
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
            employee } = req.body as CreateOrEditLeaveBalanceDto
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
            employee } = req.body as CreateOrEditLeaveBalanceDto
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
    public async GetAllAttendanceReport(req: Request, res: Response, next: NextFunction) {
        try {
            let yearmonth = Number(req.query.yearmonth);
            if (!yearmonth) {
                return res.status(400).json({ error: 'Yearmonth is required' });
            }
            let salesmen: IUser[] = []
            if (req.user.is_admin)
                salesmen = (await User.find()).filter((user) => user.assigned_permissions.includes('sales_menu'));
            else {
                let slm = await User.findById(req.user._id)
                if (slm && slm.assigned_permissions.includes('sales_menu'))
                    salesmen.push(slm)
            }
            let year = String(yearmonth).slice(0, 4);
            let month = String(yearmonth).slice(4, 6);
            let result = await Promise.all(salesmen.map(async (user) => {
                let attendance = await SalesAttendance.countDocuments({
                    date: { $gte: new Date(`${year}-${month}-01`), $lte: new Date(`${year}-${month}-31`) },
                    employee: user._id,
                    attendance: 'present'
                });
                let sw = await SalesAttendance.countDocuments({
                    date: { $gte: new Date(`${year}-${month}-01`), $lte: new Date(`${year}-${month}-31`) },
                    employee: user._id,
                    attendance: 'present',
                    is_sunday_working: true
                });
                let provided = { sl: attendance > 20 ? 1 : 0, fl: attendance > 20 ? 1 : 0, sw: sw, cl: attendance > 20 ? 1 : 0 };

                let yr = Math.floor(yearmonth / 100); // Extract the yr
                let mt = yearmonth % 100;           // Extract the mt

                if (mt === 1) {
                    // If January, go back to December of the previous yr
                    yr--;
                    mt = 12;
                } else {
                    // Otherwise, just decrease the mt
                    mt--;
                }

                // Return the new value formatted as YYYYMM
                let lastyrmt = yr * 100 + mt;


                let balance = await LeaveBalance.findOne({ yearmonth: lastyrmt, employee: user._id });
                let brought_forward = { sl: balance?.sl || 0, fl: balance?.fl || 0, sw: balance?.sw || 0, cl: balance?.cl || 0 };

                let total = {
                    sl: provided.sl + brought_forward.sl,
                    fl: provided.fl + brought_forward.fl,
                    sw: provided.sw + brought_forward.sw,
                    cl: provided.cl + brought_forward.cl
                };
                let consumedleave = await Leave.find({ yearmonth: yearmonth, employee: user._id, status: 'approved' });
                let consumed = { sl: 0, fl: 0, sw: 0, cl: 0 };
                consumedleave.forEach(leave => {
                    if (leave.leave_type === 'sl') {
                        consumed.sl += leave.leave;
                    } else if (leave.leave_type === 'fl') {
                        consumed.fl += leave.leave;
                    } else if (leave.leave_type === 'sw') {
                        consumed.sw += leave.leave;
                    } else if (leave.leave_type === 'cl') {
                        consumed.cl += leave.leave;
                    }
                });

                let carryforward = {
                    sl: total.sl - consumed.sl,
                    fl: total.fl - consumed.fl,
                    sw: total.sw - consumed.sw,
                    cl: total.cl - consumed.cl
                };

                return {
                    attendance: attendance,
                    provided: provided,
                    brought_forward: brought_forward,
                    total: total,
                    consumed: consumed,
                    carryforward: carryforward,
                    yearmonth: Number(yearmonth),
                    employee: { id: user._id, label: user.username }
                };
            }));


            return res.status(200).json(result);
        } catch (error) {
            console.error('Error fetching attendance report:', error);
            return res.status(500).json({ error: 'Failed to fetch attendance report' });
        }
    }

}