import { NextFunction, Request, Response } from 'express';
import { ErpEmployee, IErpEmployee } from '../models/dropdown/erp.employee.model';
import { VisitReport } from '../models/reports/visit.report.model';
import { decimalToTime } from '../utils/decimalToTime';
import { GetBillsAgingReportFromExcelDto, GetClientSaleReportFromExcelDto, GetErpStateFromExcelDto, GetPartyTargetReportFromExcelDto, GetPendingOrdersReportFromExcelDto, GetSaleAnalysisReportDto, GetVisitReportDto, GetVisitReportFromExcelDto } from '../dtos/erp.reports.dto';
import { PartyTargetReport } from '../models/features/partytarget.model';
import { IState, State } from '../models/dropdown/state.model';
import { ClientSaleLastYearReport, ClientSaleReport } from '../models/reports/client_sale.model';
import { BillsAgingReport } from '../models/reports/bills_aging_model';
import { PendingOrdersReport } from '../models/reports/pending_orders.model';
import { GetLastYearlyachievementBystate, GetMonthlyachievementBystate, GetMonthlytargetBystate, GetYearlyachievementBystate } from '../utils/ErpUtils';
import moment from 'moment';
import { IShoeWeight, ShoeWeight } from '../models/features/shoe.weight.model';
import { SpareDye } from '../models/features/SpareDye.model';
import { GetCategoryWiseProductionReportDto, GetDyeStatusReportDto, GetShoeWeightDiffReportDto, IColumnRowData, IRowData } from '../dtos/production.dto';
import { Production } from '../models/features/production.model';
import { User } from '../models/features/user.model';
import xlsx from 'xlsx';
import isMongoId from 'validator/lib/isMongoId';
import mongoose from 'mongoose';
import { Machine } from '../models/dropdown/machine.model';

export const GetBillsAgingReports = async (req: Request, res: Response, next: NextFunction) => {
    let state_ids = req.user?.assigned_states.map((state: IState) => { return state }) || []
    let reports: GetBillsAgingReportFromExcelDto[] = (await BillsAgingReport.find({ report_owner: { $in: state_ids } }).populate('report_owner')).map((i) => {
        return {
            report_owner: i.report_owner.state,
            account: i.account,
            total: i.plu70 + i.in70to90 + i.in90to120 + i.plus120,
            plu70: i.plu70,
            in70to90: i.in70to90,
            in90to120: i.in90to120,
            plus120: i.plus120,
            created_at: moment(i.created_at).format("DD/MM/YYYY")
        }
    })
    return res.status(200).json(reports);
}


export const GetPendingOrderReports = async (req: Request, res: Response, next: NextFunction) => {
    let state_ids = req.user?.assigned_states.map((state: IState) => { return state }) || []
    let reports: GetPendingOrdersReportFromExcelDto[] = (await PendingOrdersReport.find({ report_owner: { $in: state_ids } }).populate("report_owner")).map((i) => {
        return {
            report_owner: i.report_owner.state,
            account: i.account,
            product_family: i.product_family,
            article: i.article,
            total: (i.size5
                + i.size6
                + i.size7
                + i.size8
                + i.size9
                + i.size10
                + i.size11
                + i.size12_24pairs
                + i.size13
                + i.size11x12
                + i.size3
                + i.size4
                + i.size6to10
                + i.size7to10
                + i.size8to10
                + i.size4to8
                + i.size6to9
                + i.size5to8
                + i.size6to10A
                + i.size7to10B
                + i.size6to9A
                + i.size11close
                + i.size11to13
                + i.size3to8),
            size5: i.size5,
            size6: i.size6,
            size7: i.size7,
            size8: i.size8,
            size9: i.size9,
            size10: i.size10,
            size11: i.size11,
            size12_24pairs: i.size12_24pairs,
            size13: i.size13,
            size11x12: i.size11x12,
            size3: i.size3,
            size4: i.size4,
            size6to10: i.size6to10,
            size7to10: i.size7to10,
            size8to10: i.size8to10,
            size4to8: i.size4to8,
            size6to9: i.size6to9,
            size5to8: i.size5to8,
            size6to10A: i.size6to10A,
            size7to10B: i.size7to10B,
            size6to9A: i.size6to9A,
            size11close: i.size11close,
            size11to13: i.size11to13,
            size3to8: i.size3to8,
            created_at: moment(i.created_at).format("DD/MM/YYYY")
        }
    })
    return res.status(200).json(reports);
}


export const GetClientSaleReportsForLastYear = async (req: Request, res: Response, next: NextFunction) => {
    let state_ids = req.user?.assigned_states.map((state: IState) => { return state }) || []
    let data: GetClientSaleReportFromExcelDto[] = (await ClientSaleLastYearReport.find({ report_owner: { $in: state_ids } }).populate('report_owner')).map((i) => {
        return {
            report_owner: i.report_owner.state,
            account: i.account,
            article: i.article,
            oldqty: i.oldqty,
            newqty: i.newqty,
            total: (i.apr +
                i.may +
                i.jun +
                i.jul +
                i.aug +
                i.sep +
                i.oct +
                i.nov +
                i.dec +
                i.jan +
                i.feb +
                i.mar),
            apr: i.apr,
            may: i.may,
            jun: i.jun,
            jul: i.jul,
            aug: i.aug,
            sep: i.sep,
            oct: i.oct,
            nov: i.nov,
            dec: i.dec,
            jan: i.jan,
            feb: i.feb,
            mar: i.mar, created_at: moment(i.created_at).format("DD/MM/YYYY")
        }
    })

    return res.status(200).json(data)
}
export const GetClientSaleReports = async (req: Request, res: Response, next: NextFunction) => {
    let state_ids = req.user?.assigned_states.map((state: IState) => { return state }) || []
    let data: GetClientSaleReportFromExcelDto[] = (await ClientSaleReport.find({ report_owner: { $in: state_ids } }).populate('report_owner')).map((i) => {
        return {
            report_owner: i.report_owner.state,
            account: i.account,
            article: i.article,
            oldqty: i.oldqty,
            newqty: i.newqty,
            total: (i.apr +
                i.may +
                i.jun +
                i.jul +
                i.aug +
                i.sep +
                i.oct +
                i.nov +
                i.dec +
                i.jan +
                i.feb +
                i.mar),
            apr: i.apr,
            may: i.may,
            jun: i.jun,
            jul: i.jul,
            aug: i.aug,
            sep: i.sep,
            oct: i.oct,
            nov: i.nov,
            dec: i.dec,
            jan: i.jan,
            feb: i.feb,
            mar: i.mar, created_at: moment(i.created_at).format("DD/MM/YYYY")
        }
    });
    return res.status(200).json(data)
}
export const GetPartyTargetReports = async (req: Request, res: Response, next: NextFunction) => {

    let state_ids = req.user?.assigned_states.map((state: IState) => { return state }) || []

    let reports: GetPartyTargetReportFromExcelDto[] = (await PartyTargetReport.find({ report_owner: { $in: state_ids } }).populate('report_owner')).map((item) => {
        return {
            slno: item.slno,
            PARTY: item.PARTY,
            Create_Date: item.Create_Date,
            STATION: item.STATION,
            SALES_OWNER: item.SALES_OWNER,
            report_owner: item.report_owner.state,
            All_TARGET: item.All_TARGET,
            TARGET: item.TARGET,
            PROJECTION: item.PROJECTION,
            GROWTH: item.GROWTH,
            TARGET_ACHIEVE: item.TARGET_ACHIEVE,
            TOTAL_SALE_OLD: item.TOTAL_SALE_OLD,
            TOTAL_SALE_NEW: item.TOTAL_SALE_NEW,
            Last_Apr: item.Last_Apr,
            Cur_Apr: item.Cur_Apr,
            Last_May: item.Last_May,
            Cur_May: item.Cur_May,
            Last_Jun: item.Last_Jun,
            Cur_Jun: item.Cur_Jun,
            Last_Jul: item.Last_Jul,
            Cur_Jul: item.Cur_Jul,
            Last_Aug: item.Last_Aug,
            Cur_Aug: item.Cur_Aug,
            Last_Sep: item.Last_Sep,
            Cur_Sep: item.Cur_Sep,
            Last_Oct: item.Last_Oct,
            Cur_Oct: item.Cur_Oct,
            Last_Nov: item.Last_Nov,
            Cur_Nov: item.Cur_Nov,
            Last_Dec: item.Last_Dec,
            Cur_Dec: item.Cur_Dec,
            Last_Jan: item.Last_Jan,
            Cur_Jan: item.Cur_Jan,
            Last_Feb: item.Last_Feb,
            Cur_Feb: item.Cur_Feb,
            Last_Mar: item.Last_Mar,
            Cur_Mar: item.Cur_Mar,
            created_at: moment(item.created_at).format("DD/MM/YYYY")
        }
    })

    return res.status(200).json(reports)
}
export const GetSaleAnalysisReport = async (req: Request, res: Response, next: NextFunction) => {
    let month = Number(req.params.month)
    if (req.user) {
        let result: GetSaleAnalysisReportDto[] = []
        let user = await User.findById(req.user._id).populate('assigned_states');
        if (user) {
            let states = user.assigned_states;
            for (let i = 0; i < states.length; i++) {
                let reports = await PartyTargetReport.find({ report_owner: states[i]._id })
                let antarget = states[i].apr + states[i].may + states[i].jun + states[i].jul + states[i].aug + states[i].sep + states[i].oct + states[i].nov + states[i].dec + states[i].jan + states[i].feb + states[i].mar;

                if (reports && reports.length > 0)
                    result.push({
                        state: states[i].state,
                        monthly_target: GetMonthlytargetBystate(states[i], month),
                        monthly_achivement: GetMonthlyachievementBystate(reports, month),
                        monthly_percentage: (Math.round((GetMonthlyachievementBystate(reports, 6) / GetMonthlytargetBystate(states[i], month)) * 10000) / 100),
                        annual_target: antarget,
                        annual_achivement: GetYearlyachievementBystate(reports),
                        annual_percentage: (Math.round((GetYearlyachievementBystate(reports) / antarget) * 10000) / 100),
                        last_year_sale: GetLastYearlyachievementBystate(reports),
                        last_year_sale_percentage_comparison: (Math.round((GetLastYearlyachievementBystate(reports) / antarget) * 10000) / 100)
                    })
            }
        }
        return res.status(200).json(result)
    }
    else
        return res.status(403).json({ message: "not authorized" })

}


export const AssignErpStatesToUsers = async (req: Request, res: Response, next: NextFunction) => {
    const { state_ids, user_ids, flag } = req.body as {
        user_ids: string[],
        state_ids: string[],
        flag: number
    }
    if (state_ids && state_ids.length === 0)
        return res.status(400).json({ message: "please select one state " })
    if (user_ids && user_ids.length === 0)
        return res.status(400).json({ message: "please select one state owner" })

    let owners = user_ids

    if (flag == 0) {
        for (let i = 0; i < owners.length; i++) {
            let owner = await User.findById(owners[i]).populate('assigned_states');
            if (owner) {
                let oldstates = owner.assigned_states.map((item) => { return item._id.valueOf() });
                oldstates = oldstates.filter((item) => { return !state_ids.includes(item) });
                await User.findByIdAndUpdate(owner._id, {
                    assigned_states: oldstates
                })
            }
        }
    }
    else for (let k = 0; k < owners.length; k++) {
        const user = await User.findById(owners[k]).populate('assigned_states')
        if (user) {
            let assigned_states = user.assigned_states;
            for (let i = 0; i <= state_ids.length; i++) {
                if (!assigned_states.map(i => { return i._id.valueOf() }).includes(state_ids[i])) {
                    let state = await State.findById(state_ids[i]);
                    if (state)
                        assigned_states.push(state)
                }
            }

            user.assigned_states = assigned_states
            await user.save();
        }

    }

    return res.status(200).json({ message: "successfull" })
}

export const AssignErpEmployeesToUsers = async (req: Request, res: Response, next: NextFunction) => {
    const { emp_ids, user_ids, flag } = req.body as {
        user_ids: string[],
        emp_ids: string[],
        flag: number
    }
    if (emp_ids && emp_ids.length === 0)
        return res.status(400).json({ message: "please select one employee " })
    if (user_ids && user_ids.length === 0)
        return res.status(400).json({ message: "please select one user" })

    let owners = user_ids

    if (flag == 0) {
        for (let i = 0; i < owners.length; i++) {
            let owner = await User.findById(owners[i]).populate('assigned_erpEmployees');
            if (owner) {
                let oldemps = owner.assigned_erpEmployees.map((item) => { return item._id.valueOf() });
                oldemps = oldemps.filter((item) => { return !emp_ids.includes(item) });
                await User.findByIdAndUpdate(owner._id, {
                    assigned_erpEmployees: oldemps
                })
            }
        }
    }
    else for (let k = 0; k < owners.length; k++) {
        const user = await User.findById(owners[k]).populate('assigned_erpEmployees')
        if (user) {
            let assigned_erpEmployees = user.assigned_erpEmployees;
            for (let i = 0; i <= emp_ids.length; i++) {
                if (!assigned_erpEmployees.map(i => { return i._id.valueOf() }).includes(emp_ids[i])) {
                    let emp = await ErpEmployee.findById(emp_ids[i]);
                    if (emp)
                        assigned_erpEmployees.push(emp)
                }
            }

            user.assigned_erpEmployees = assigned_erpEmployees
            await user.save();
        }

    }

    return res.status(200).json({ message: "successfull" })
}
export const BulkCreateAndUpdateErpStatesFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetErpStateFromExcelDto[] = []
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
        let workbook_response: GetErpStateFromExcelDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        if (workbook_response.length > 3000) {
            return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
        }

        for (let i = 0; i < workbook_response.length; i++) {
            let item = workbook_response[i]
            let state: string | null = item.state
            let apr: number | null = Number(item.apr)
            let may: number | null = Number(item.may)
            let jun: number | null = Number(item.jun)
            let jul: number | null = Number(item.jul)
            let aug: number | null = Number(item.aug)
            let sep: number | null = Number(item.sep)
            let oct: number | null = Number(item.oct)
            let nov: number | null = Number(item.nov)
            let dec: number | null = Number(item.dec)
            let jan: number | null = Number(item.jan)
            let feb: number | null = Number(item.feb)
            let mar: number | null = Number(item.mar)

            if (state) {
                if (item._id && isMongoId(item._id)) {
                    await State.findByIdAndUpdate(item._id, {
                        state: state,
                        apr: apr || 0,
                        may: may || 0,
                        jun: jun || 0,
                        jul: jul || 0,
                        aug: aug || 0,
                        sep: sep || 0,
                        oct: oct || 0,
                        nov: nov || 0,
                        dec: dec || 0,
                        jan: jan || 0,
                        feb: feb || 0,
                        mar: mar || 0,
                        created_by: req.user,
                        updated_by: req.user,
                        created_at: new Date(),
                        updated_at: new Date()
                    })
                    statusText = "updated"
                }

                if (!item._id || !isMongoId(item._id)) {
                    let oldstate = await State.findOne({ state: state })
                    if (!oldstate) {
                        await new State({
                            ...item,
                            _id: new mongoose.Types.ObjectId(),
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
            else
                statusText = "required state"

            result.push({
                ...item,
                status: statusText
            })
        }


    }
    return res.status(200).json(result);
}

export const BulkPendingOrderReportFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetPendingOrdersReportFromExcelDto[] = []
    if (!req.file)
        return res.status(400).json({
            message: "please provide an Excel file",
        });
    await PendingOrdersReport.deleteMany({})
    if (req.file) {
        const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
        if (req.file.size > 100 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
        const workbook = xlsx.read(req.file.buffer);
        let workbook_sheet = workbook.SheetNames;
        let workbook_response: GetPendingOrdersReportFromExcelDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        let statusText = ""

        for (let i = 0; i < workbook_response.length; i++) {
            let report = workbook_response[i]
            let report_owner: string | null = report.report_owner
            let account: string | null = report.account
            let article: string | null = report.article
            let product_family: string | null = report.product_family
            let state: string | null = report.report_owner
            let size5: number | null = Number(report.size5)
            let size6: number | null = Number(report.size6)
            let size7: number | null = Number(report.size7)
            let size8: number | null = Number(report.size8)
            let size9: number | null = Number(report.size9)
            let size10: number | null = Number(report.size10)
            let size11: number | null = Number(report.size11)
            let size12_24pairs: number | null = Number(report.size12_24pairs)
            let size13: number | null = Number(report.size13)
            let size11x12: number | null = Number(report.size11x12)
            let size3: number | null = Number(report.size3)
            let size4: number | null = Number(report.size4)
            let size6to10: number | null = Number(report.size6to10)
            let size7to10: number | null = Number(report.size7to10)
            let size8to10: number | null = Number(report.size8to10)
            let size4to8: number | null = Number(report.size4to8)
            let size6to9: number | null = Number(report.size6to9)
            let size5to8: number | null = Number(report.size5to8)
            let size6to10A: number | null = Number(report.size6to10A)
            let size7to10B: number | null = Number(report.size7to10B)
            let size6to9A: number | null = Number(report.size6to9A)
            let size11close: number | null = Number(report.size11close)
            let size11to13: number | null = Number(report.size11to13)
            let size3to8: number | null = Number(report.size3to8)

            let validated = true

            if (!report_owner) {
                validated = false
                statusText = "report owner required"
            }
            if (!validated) {
                result.push({
                    ...report,
                    status: statusText
                })
            }

            if (validated) {
                let owner = await State.findOne({ state: report.report_owner })
                if (owner) {
                    await new PendingOrdersReport({
                        report_owner: owner,
                        account: account,
                        article: article,
                        product_family: product_family,
                        state: state,
                        size5: size5 || 0,
                        size6: size6 || 0,
                        size7: size7 || 0,
                        size8: size8 || 0,
                        size9: size9 || 0,
                        size10: size10 || 0,
                        size11: size11 || 0,
                        size12_24pairs: size12_24pairs || 0,
                        size13: size13 || 0,
                        size11x12: size11x12 || 0,
                        size3: size3 || 0,
                        size4: size4 || 0,
                        size6to10: size6to10 || 0,
                        size7to10: size7to10 || 0,
                        size8to10: size8to10 || 0,
                        size4to8: size4to8 || 0,
                        size6to9: size6to9 || 0,
                        size5to8: size5to8 || 0,
                        size6to10A: size6to10A || 0,
                        size7to10B: size7to10B || 0,
                        size6to9A: size6to9A || 0,
                        size11close: size11close || 0,
                        size11to13: size11to13 || 0,
                        size3to8: size3to8 || 0,
                        created_by: req.user,
                        updated_by: req.user,
                        created_at: new Date(),
                        updated_at: new Date()
                    }).save()
                }
            }
        }
    }
    return res.status(200).json(result);
}
export const BulkCreateBillsAgingReportFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetBillsAgingReportFromExcelDto[] = []
    if (!req.file)
        return res.status(400).json({
            message: "please provide an Excel file",
        });
    await BillsAgingReport.deleteMany({})
    if (req.file) {
        const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
        if (req.file.size > 100 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
        const workbook = xlsx.read(req.file.buffer);
        let workbook_sheet = workbook.SheetNames;
        let workbook_response: GetBillsAgingReportFromExcelDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        let statusText = ""

        for (let i = 0; i < workbook_response.length; i++) {
            let report = workbook_response[i]
            let report_owner: string | null = report.report_owner
            let account: string | null = report.account
            let plu70: number | null = Number(report.plu70)
            let in70to90: number | null = Number(report.in70to90)
            let in90to120: number | null = Number(report.in90to120)
            let plus120: number | null = Number(report.plus120)

            let validated = true

            if (!report_owner) {
                validated = false
                statusText = "report owner required"
            }
            if (!validated) {
                result.push({
                    ...report,
                    status: statusText
                })
            }

            if (validated) {
                let owner = await State.findOne({ state: report.report_owner })
                if (owner) {
                    await new BillsAgingReport({
                        report_owner: owner,
                        plu70: plu70,
                        in70to90: in70to90,
                        in90to120: in90to120,
                        account: account,
                        plus120: plus120,
                        created_by: req.user,
                        updated_by: req.user,
                        created_at: new Date(),
                        updated_at: new Date()
                    }).save()
                }
            }
        }
    }
    return res.status(200).json(result);
}
export const BulkCreateClientSaleReportFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetClientSaleReportFromExcelDto[] = []
    if (!req.file)
        return res.status(400).json({
            message: "please provide an Excel file",
        });
    await ClientSaleReport.deleteMany({})
    if (req.file) {
        const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
        if (req.file.size > 100 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
        const workbook = xlsx.read(req.file.buffer);
        let workbook_sheet = workbook.SheetNames;
        let workbook_response: GetClientSaleReportFromExcelDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        let statusText = ""

        for (let i = 0; i < workbook_response.length; i++) {
            let report = workbook_response[i]
            let report_owner: string | null = report.report_owner
            let article: string | null = report.article
            let account: string | null = report.account
            let oldqty: number | null = report.oldqty
            let newqty: number | null = report.newqty
            let apr: number | null = report.apr
            let may: number | null = report.may
            let jun: number | null = report.jun
            let jul: number | null = report.jul
            let aug: number | null = report.aug
            let sep: number | null = report.sep
            let oct: number | null = report.oct
            let nov: number | null = report.nov
            let dec: number | null = report.dec
            let jan: number | null = report.jan
            let feb: number | null = report.feb
            let mar: number | null = report.mar
            let validated = true

            if (!report_owner) {
                validated = false
                statusText = "report owner required"
            }
            if (!validated) {
                result.push({
                    ...report,
                    status: statusText
                })
            }

            if (validated) {
                let owner = await State.findOne({ state: report.report_owner })
                if (owner) {
                    await new ClientSaleReport({
                        report_owner: owner,
                        article: article,
                        account: account,
                        oldqty: oldqty,
                        newqty: newqty,
                        apr: apr,
                        may: may,
                        jun: jun,
                        jul: jul,
                        aug: aug,
                        sep: sep,
                        oct: oct,
                        nov: nov,
                        dec: dec,
                        jan: jan,
                        feb: feb,
                        mar: mar,
                        created_by: req.user,
                        updated_by: req.user,
                        created_at: new Date(),
                        updated_at: new Date()
                    }).save()
                }
            }
        }
    }
    return res.status(200).json(result);
}

export const BulkCreateClientSaleReportFromExcelForLastYear = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetClientSaleReportFromExcelDto[] = []
    if (!req.file)
        return res.status(400).json({
            message: "please provide an Excel file",
        });
    await ClientSaleLastYearReport.deleteMany({})
    if (req.file) {
        const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
        if (req.file.size > 100 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
        const workbook = xlsx.read(req.file.buffer);
        let workbook_sheet = workbook.SheetNames;
        let workbook_response: GetClientSaleReportFromExcelDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        let statusText = ""

        for (let i = 0; i < workbook_response.length; i++) {
            let report = workbook_response[i]
            let report_owner: string | null = report.report_owner
            let article: string | null = report.article
            let account: string | null = report.account
            let oldqty: number | null = report.oldqty
            let newqty: number | null = report.newqty
            let apr: number | null = report.apr
            let may: number | null = report.may
            let jun: number | null = report.jun
            let jul: number | null = report.jul
            let aug: number | null = report.aug
            let sep: number | null = report.sep
            let oct: number | null = report.oct
            let nov: number | null = report.nov
            let dec: number | null = report.dec
            let jan: number | null = report.jan
            let feb: number | null = report.feb
            let mar: number | null = report.mar
            let validated = true
            if (!report_owner) {
                validated = false
                statusText = "report owner required"
            }
            if (!validated) {
                result.push({
                    ...report,
                    status: statusText
                })
            }

            if (validated) {
                let owner = await State.findOne({ state: report.report_owner })
                if (owner) {
                    await new ClientSaleLastYearReport({
                        report_owner: owner,
                        article: article,
                        account: account,
                        oldqty: oldqty,
                        newqty: newqty,
                        apr: apr,
                        may: may,
                        jun: jun,
                        jul: jul,
                        aug: aug,
                        sep: sep,
                        oct: oct,
                        nov: nov,
                        dec: dec,
                        jan: jan,
                        feb: feb,
                        mar: mar,
                        created_by: req.user,
                        updated_by: req.user,
                        created_at: new Date(),
                        updated_at: new Date()
                    }).save()
                }
            }
        }
    }
    return res.status(200).json(result);
}


export const BulkCreatePartyTargetReportFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetPartyTargetReportFromExcelDto[] = []
    if (!req.file)
        return res.status(400).json({
            message: "please provide an Excel file",
        });
    await PartyTargetReport.deleteMany({})
    if (req.file) {
        const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
        if (req.file.size > 100 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
        const workbook = xlsx.read(req.file.buffer, { raw: true });
        let workbook_sheet = workbook.SheetNames;
        let workbook_response: GetPartyTargetReportFromExcelDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        let statusText = ""

        for (let i = 0; i < workbook_response.length; i++) {
            let report = workbook_response[i]
            let slno: string | null = report.slno
            let PARTY: string | null = report.PARTY
            let Create_Date: string | null = report.Create_Date
            let STATION: string | null = report.STATION
            let SALES_OWNER: string | null = report.SALES_OWNER
            let report_owner: string | null = report.report_owner
            let All_TARGET: string | null = report.All_TARGET
            let TARGET: number | null = Number(report.TARGET) || null
            let PROJECTION: number | null = Number(report.PROJECTION) || null
            let GROWTH: number | null = Number(report.GROWTH) || null
            let TARGET_ACHIEVE: number | null = Number(report.TARGET_ACHIEVE) || null
            let TOTAL_SALE_OLD: number | null = Number(report.TOTAL_SALE_OLD) || null
            let TOTAL_SALE_NEW: number | null = Number(report.TOTAL_SALE_NEW) || null
            let Last_Apr: number | null = Number(report.Last_Apr) || null
            let Cur_Apr: number | null = Number(report.Cur_Apr) || null
            let Last_May: number | null = Number(report.Last_May) || null
            let Cur_May: number | null = Number(report.Cur_May) || null
            let Last_Jun: number | null = Number(report.Last_Jun) || null
            let Cur_Jun: number | null = Number(report.Cur_Jun) || null
            let Last_Jul: number | null = Number(report.Last_Jul) || null
            let Cur_Jul: number | null = Number(report.Cur_Jul) || null
            let Last_Aug: number | null = Number(report.Last_Aug) || null
            let Cur_Aug: number | null = Number(report.Cur_Aug) || null
            let Last_Sep: number | null = Number(report.Last_Sep) || null
            let Cur_Sep: number | null = Number(report.Cur_Sep) || null
            let Last_Oct: number | null = Number(report.Last_Oct) || null
            let Cur_Oct: number | null = Number(report.Cur_Oct) || null
            let Last_Nov: number | null = Number(report.Last_Nov) || null
            let Cur_Nov: number | null = Number(report.Cur_Nov) || null
            let Last_Dec: number | null = Number(report.Last_Dec) || null
            let Cur_Dec: number | null = Number(report.Cur_Dec) || null
            let Last_Jan: number | null = Number(report.Last_Jan) || null
            let Cur_Jan: number | null = Number(report.Cur_Jan) || null
            let Last_Feb: number | null = Number(report.Last_Feb) || null
            let Cur_Feb: number | null = Number(report.Cur_Feb) || null
            let Last_Mar: number | null = Number(report.Last_Mar) || null
            let Cur_Mar: number | null = Number(report.Cur_Mar) || null
            let validated = true

            if (!report_owner) {
                validated = false
                statusText = "report owner required"
            }
            if (!validated) {
                result.push({
                    ...report,
                    status: statusText
                })
            }

            if (validated) {
                let owner = await State.findOne({ state: report.report_owner })
                if (owner) {
                    await new PartyTargetReport({
                        report_owner: owner,
                        slno: slno,
                        PARTY: PARTY,
                        Create_Date: Create_Date,
                        STATION: STATION,
                        SALES_OWNER: SALES_OWNER,
                        All_TARGET: All_TARGET || "",
                        TARGET: TARGET || 0,
                        PROJECTION: PROJECTION || 0,
                        GROWTH: GROWTH || 0,
                        TARGET_ACHIEVE: TARGET_ACHIEVE || 0,
                        TOTAL_SALE_OLD: TOTAL_SALE_OLD || 0,
                        TOTAL_SALE_NEW: TOTAL_SALE_NEW || 0,
                        Last_Apr: Last_Apr || 0,
                        Cur_Apr: Cur_Apr || 0,
                        Last_May: Last_May || 0,
                        Cur_May: Cur_May || 0,
                        Last_Jun: Last_Jun || 0,
                        Cur_Jun: Cur_Jun || 0,
                        Last_Jul: Last_Jul || 0,
                        Cur_Jul: Cur_Jul || 0,
                        Last_Aug: Last_Aug || 0,
                        Cur_Aug: Cur_Aug || 0,
                        Last_Sep: Last_Sep || 0,
                        Cur_Sep: Cur_Sep || 0,
                        Last_Oct: Last_Oct || 0,
                        Cur_Oct: Cur_Oct || 0,
                        Last_Nov: Last_Nov || 0,
                        Cur_Nov: Cur_Nov || 0,
                        Last_Dec: Last_Dec || 0,
                        Cur_Dec: Cur_Dec || 0,
                        Last_Jan: Last_Jan || 0,
                        Cur_Jan: Cur_Jan || 0,
                        Last_Feb: Last_Feb || 0,
                        Cur_Feb: Cur_Feb || 0,
                        Last_Mar: Last_Mar || 0,
                        Cur_Mar: Cur_Mar || 0,
                        created_by: req.user,
                        updated_by: req.user,
                        created_at: new Date(),
                        updated_at: new Date()
                    }).save()
                }
            }
        }
    }
    return res.status(200).json(result);
}


export const GetVisitReports = async (req: Request, res: Response, next: NextFunction) => {
    let employee_ids = req.user?.assigned_erpEmployees.map((employee: IErpEmployee) => { return employee }) || []
    let reports: GetVisitReportDto[] = (await VisitReport.find({ employee: { $in: employee_ids } }).populate('employee').populate('created_by').populate('updated_by')).map((i) => {
        return {
            _id: i._id,
            employee: i.employee.name,
            visit_date: moment(i.visit_date).format("DD/MM/YYYY"),
            customer: i.customer,
            intime: i.intime,
            outtime: i.outtime,
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

export const BulkCreateVisitReportFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetVisitReportFromExcelDto[] = []
    if (!req.file)
        return res.status(400).json({
            message: "please provide an Excel file",
        });
    await VisitReport.deleteMany({})
    if (req.file) {
        const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
        if (req.file.size > 100 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
        const workbook = xlsx.read(req.file.buffer);
        let workbook_sheet = workbook.SheetNames;
        let workbook_response: GetVisitReportFromExcelDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );


        let statusText = ""

        for (let i = 0; i < workbook_response.length; i++) {
            let report = workbook_response[i]
            let employee: string | null = report.employee
            let visit_date: string | null = report.visit_date
            let customer: string | null = report.customer
            let intime: string | null = report.intime
            let outtime: string | null = report.outtime
            let visitInLocation: string | null = report.visitInLocation
            let visitOutLocation: string | null = report.visitOutLocation
            let remarks: string | null = report.remarks


            let validated = true

            if (!employee) {
                validated = false
                statusText = "employee required"
            }
            if (!visit_date) {
                validated = false
                statusText = "visit date required"
            }
            if (!validated) {
                result.push({
                    ...report,
                    status: statusText
                })
            }

            if (validated) {

                let owner = await ErpEmployee.findOne({ name: employee })
                if (owner) {
                    await new VisitReport({
                        employee: owner,
                        visit_date: new Date(new Date(Date.UTC(1900, 0, 1)).getTime() + (Number(visit_date) - 2) * 86400000),
                        customer,
                        intime: intime ? decimalToTime(intime) : "",
                        outtime: outtime ? decimalToTime(outtime) : "",
                        visitInLocation,
                        visitOutLocation,
                        remarks,
                        created_by: req.user,
                        updated_by: req.user,
                        created_at: new Date(),
                        updated_at: new Date()
                    }).save()
                }
            }
        }
    }
    return res.status(200).json(result);
}


export const GetShoeWeightDifferenceReports = async (req: Request, res: Response, next: NextFunction) => {
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let weights: IShoeWeight[] = []
    let reports: GetShoeWeightDiffReportDto[] = []
    let dt1 = new Date(String(start_date))
    dt1.setHours(0)
    dt1.setMinutes(0)
    let dt2 = new Date(String(end_date))
    dt2.setHours(0)
    dt2.setMinutes(0)
    weights = await ShoeWeight.find({ created_at: { $gte: dt1, $lt: dt2 } }).populate('dye').populate('machine').populate('article').populate('created_by').populate('updated_by').sort("dye.dye_number")
    reports = weights.map((weight) => {
        return {
            date: moment(weight.created_at).format("DD/MM/YYYY"),
            dye_no: weight.dye.dye_number,
            article: weight.article.display_name,
            size: weight.dye.size,
            st_weight: weight.dye.stdshoe_weight || 0,
            machine: weight.machine.display_name,
            w1: weight.shoe_weight1 || 0,
            w2: weight.shoe_weight2 || 0,
            w3: weight.shoe_weight3 || 0,
            u1: weight.upper_weight1 || 0,
            u2: weight.upper_weight2 || 0,
            u3: weight.upper_weight3 || 0,
            d1: weight.shoe_weight1 && weight.upper_weight1 ? (weight.shoe_weight1 - weight.upper_weight1 - weight.dye.stdshoe_weight) : 0,
            d2: weight.shoe_weight2 && weight.upper_weight2 ? (weight.shoe_weight2 - weight.upper_weight2 - weight.dye.stdshoe_weight) : 0,
            d3: weight.shoe_weight3 && weight.upper_weight3 ? (weight.shoe_weight3 - weight.upper_weight3 - weight.dye.stdshoe_weight) : 0,
            person: weight.created_by.username
        }
    })
    return res.status(200).json(reports)
}

export const GetThekedarWiseProductionReports = async (req: Request, res: Response, next: NextFunction) => {
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let production: IColumnRowData = {
        columns: [],
        rows: []
    };
    let dt1 = new Date(String(start_date))
    dt1.setHours(0)
    dt1.setMinutes(0)
    let dt2 = new Date(String(end_date))
    dt2.setHours(0)
    dt2.setMinutes(0)
    const oneDay = 24 * 60 * 60 * 1000;
    let users = await User.find().sort("username")
    //columns
    production.columns.push({ key: 'date', header: 'Date', type: 'date' });
    users = users.filter((u) => { return u.assigned_permissions.includes('production_view') })
    for (let k = 0; k < users.length; k++) {
        let user = users[k]
        production.columns.push({ key: user.username, header: String(user.username).toUpperCase(), type: 'number' })
    }
    production.columns.push({ key: 'total', header: 'Total', type: 'number' });
    while (dt1 <= dt2) {
        //rows
        let total = 0
        let obj: IRowData = {}
        obj['date'] = moment(dt1).format("DD/MM/YYYY")
        for (let k = 0; k < users.length; k++) {
            let user = users[k]
            let data = await Production.find({ date: { $gte: dt1, $lt: new Date(dt1.getTime() + oneDay) }, thekedar: user._id })
            let result = data.reduce((a, b) => { return Number(a) + Number(b.production) }, 0)
            if (result === 0)
                obj[users[k].username] = result;
            else
                obj[users[k].username] = result;
            total += result
        }
        obj['total'] = total
        production.rows.push(obj);
        dt1 = new Date(dt1.getTime() + oneDay);
    }


    return res.status(200).json(production)
}

export const GetMachineWiseProductionReports = async (req: Request, res: Response, next: NextFunction) => {
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let production: IColumnRowData = {
        columns: [],
        rows: []
    };
    let dt1 = new Date(String(start_date))
    dt1.setHours(0)
    dt1.setMinutes(0)
    let dt2 = new Date(String(end_date))
    dt2.setHours(0)
    dt2.setMinutes(0)
    const oneDay = 24 * 60 * 60 * 1000;
    let machines = await Machine.find({ active: true }).sort('serial_no')
    //columns
    production.columns.push({ key: 'date', header: 'Date', type: 'date' });
    for (let k = 0; k < machines.length; k++) {
        production.columns.push({ key: machines[k].name, header: String(machines[k].display_name).toUpperCase(), type: 'number' })
    }
    production.columns.push({ key: 'total', header: 'Total', type: 'number' });

    //rows
    while (dt1 <= dt2) {
        let total = 0
        let obj: IRowData = {}
        obj['date'] = moment(dt1).format("DD/MM/YYYY")
        for (let k = 0; k < machines.length; k++) {
            let data = await Production.find({ date: { $gte: dt1, $lt: new Date(dt1.getTime() + oneDay) }, machine: machines[k]._id })
            let result = data.reduce((a, b) => { return Number(a) + Number(b.production) }, 0)
            if (result === 0)
                obj[machines[k].name] = result;
            else
                obj[machines[k].name] = result;
            total += result
        }
        obj['total'] = total
        production.rows.push(obj);
        dt1 = new Date(dt1.getTime() + oneDay);
    }

    return res.status(200).json(production)
}


export const GetCategoryWiseProductionReports = async (req: Request, res: Response, next: NextFunction) => {
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let productions: GetCategoryWiseProductionReportDto[] = [];
    let dt1 = new Date(String(start_date))
    dt1.setHours(0)
    dt1.setMinutes(0)
    let dt2 = new Date(String(end_date))
    dt2.setHours(0)
    dt2.setMinutes(0)
    const oneDay = 24 * 60 * 60 * 1000;

    while (dt1 <= dt2) {

        let data = await Production.find({ date: { $gte: dt1, $lt: new Date(dt1.getTime() + oneDay) } }).populate('machine')

        let verpluslymphaprod = data.filter((prod) => { return prod.machine.category === "vertical" || prod.machine.category === "lympha" }).reduce((a, b) => { return Number(a) + Number(b.production) }, 0)

        let puprod = data.filter((prod) => { return prod.machine.category === "pu" }).reduce((a, b) => { return Number(a) + Number(b.production) }, 0)
        let gumbootprod = data.filter((prod) => { return prod.machine.category === "gumboot" }).reduce((a, b) => { return Number(a) + Number(b.production) }, 0)
        let total = verpluslymphaprod + puprod + gumbootprod;
        productions.push({
            date: moment(dt1).format("DD/MM/YYYY"),
            total: total,
            verticalpluslympha: verpluslymphaprod,
            pu: puprod,
            gumboot: gumbootprod
        })
        dt1 = new Date(dt1.getTime() + oneDay);
    }
    return res.status(200).json(productions)
}

export const GetDyeStatusReport = async (req: Request, res: Response, next: NextFunction) => {
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let reports: GetDyeStatusReportDto[] = [];

    let dt1 = new Date(String(start_date))
    dt1.setHours(0)
    dt1.setMinutes(0)
    let dt2 = new Date(String(end_date))
    dt2.setHours(0)
    dt2.setMinutes(0)

    let sparedyes = await SpareDye.find({ created_at: { $gte: dt1, $lt: dt2 } }).populate('dye').populate('created_by').populate('location').sort('-created_at')

    let weights = await ShoeWeight.find({ created_at: { $gte: dt1, $lt: dt2 } }).populate('dye').populate('machine').populate('article').populate('created_by').populate('updated_by').sort("-created_at")

    for (let i = 0; i < sparedyes.length; i++) {
        let dye = sparedyes[i];
        if (dye) {
            reports.push({
                _id: dye._id,
                dye: dye.dye.dye_number,
                article: "",
                size: dye.dye.size,
                std_weight: dye.dye.stdshoe_weight,
                location: dye.location.name,
                repair_required: dye.repair_required ? "Need repair" : "no Need",
                remarks: dye.remarks,
                created_at: dye.created_at && moment(dye.created_at).format("DD/MM/YYYY"),
                created_by: { id: dye.created_by._id, value: dye.created_by.username, label: dye.created_by.username }
            })
        }
    }
    for (let i = 0; i < weights.length; i++) {
        let dye = weights[i];
        if (dye) {
            reports.push({
                _id: dye._id,
                dye: dye.dye.dye_number,
                article: dye.article.name || "",
                size: dye.dye.size,
                std_weight: dye.dye.stdshoe_weight,
                location: dye.machine.name || "",
                repair_required: "",
                remarks: "",
                created_at: dye.created_at && moment(dye.created_at).format("DD/MM/YYYY"),
                created_by: { id: dye.created_by._id, value: dye.created_by.username, label: dye.created_by.username }
            })
        }
    }

    return res.status(200).json(reports)
}