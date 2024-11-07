import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import { GetBillsAgingReportFromExcelDto, GetClientSaleReportFromExcelDto, GetPartyTargetReportFromExcelDto, GetPendingOrdersReportFromExcelDto, GetSaleAnalysisReportDto, GetVisitReportDto, GetVisitReportFromExcelDto } from "../dtos";
import { IState, State } from "../models/erp-state";
import { BillsAgingReport } from "../models/bills-ageing";
import moment from "moment";
import { PendingOrdersReport } from "../models/pending-order";
import { ClientSaleLastYearReport, ClientSaleReport } from "../models/client-sale";
import { PartyTargetReport } from "../models/party-target";
import { User } from "../models/user";
import { GetLastYearlyachievementBystate, GetMonthlyachievementBystate, GetMonthlytargetBystate, GetYearlyachievementBystate } from "../utils/erpReportHelpers";
import { ErpEmployee, IErpEmployee } from "../models/erp-employee";
import { VisitReport } from "../models/visit-report";
import { decimalToTimeForXlsx } from "../utils/decimalToTimeForXlsx";

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
                let owner = await State.findOne({ state: report.report_owner.toLowerCase()})
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
                let owner = await State.findOne({ state: report.report_owner.toLowerCase()})
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
                let owner = await State.findOne({ state: report.report_owner.toLowerCase()})
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
                let owner = await State.findOne({ state: report.report_owner.toLowerCase()})
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
                let owner = await State.findOne({ state: report.report_owner.toLowerCase()})
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
                        intime: intime ? decimalToTimeForXlsx(intime) : "",
                        outtime: outtime ? decimalToTimeForXlsx(outtime) : "",
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