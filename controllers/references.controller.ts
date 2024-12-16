import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import ConvertJsonToExcel from "../services/ConvertJsonToExcel";
import { GetReferenceDto, GetReferenceExcelDto, GetReferenceReportForSalesmanDto } from "../dtos/references.dto";
import isMongoId from "validator/lib/isMongoId";
import { Reference } from "../models/references.model";
import { isDate } from "moment";
import { excelSerialToDate, invalidate, parseExcelDate } from "../utils/datesHelper";
import { User } from "../models/user.model";
import { ICRMState } from "../models/crm-state.model";


export const GetReferencesReport = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetReferenceDto[] = []
    const data = await Reference.aggregate(
        [
            {
                $group: {
                    _id: { reference: "$reference", party: "$party" }, // Group by reference, party, and date
                    id: { $first: "$_id" },
                    total_sale_scope: { $sum: "$sale_scope" }, // Summing sale_scope for each group
                    gst: { $first: "$gst" }, // Assuming same GST for each group
                    address: { $first: "$address" }, // Assuming same address for each group
                    state: { $first: "$state" }, // Assuming same state for each group
                    pincode: { $first: "$pincode" }, // Assuming same pincode for each group
                    business: { $first: "$business" }, // Assuming same business for each group
                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$id",
                    reference: "$_id.reference",
                    party: "$_id.party",
                    date: "$_id.date",
                    total_sale_scope: 1,
                    gst: 1,
                    address: 1,
                    state: 1,
                    pincode: 1,
                    business: 1
                }
            }
        ]
    )

    result = data.map((ref) => {
        return {
            _id: ref.id,
            gst: ref.gst,
            party: ref.party,
            address: ref.address,
            state: ref.state,
            pincode: ref.pincode,
            business: ref.business,
            sale_scope: Math.round((ref.total_sale_scope / 1000) - 0.1),
            reference: ref.reference
        }
    })
    return res.status(200).json(result)
}

export const GetReferencesReportForSalesman = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetReferenceReportForSalesmanDto[] = []
    let assigned_states: string[] = []
    let user = await User.findById(req.user._id).populate('assigned_crm_states')
    user && user?.assigned_crm_states.map((state: ICRMState) => {
        assigned_states.push(state.state)
        if (state.alias1)
            assigned_states.push(state.alias1)
        if (state.alias2)
            assigned_states.push(state.alias2)
    });
    const data = await Reference.aggregate(
        [
            {
                $match: {
                    state: { $in: assigned_states }  // Filter documents where the lowercase state is 'haryana'
                }
            },
            {
                $group: {
                    _id: { reference: "$reference", party: "$party" }, // Group by reference, party, and date
                    id: { $first: "$_id" },
                    total_sale_scope: { $sum: "$sale_scope" }, // Summing sale_scope for each group
                    gst: { $first: "$gst" }, // Assuming same GST for each group
                    address: { $first: "$address" }, // Assuming same address for each group
                    state: { $first: "$state" }, // Assuming same state for each group
                    pincode: { $first: "$pincode" }, // Assuming same pincode for each group
                    business: { $first: "$business" }, // Assuming same business for each group
                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$id",
                    reference: "$_id.reference",
                    party: "$_id.party",
                    date: "$_id.date",
                    total_sale_scope: 1,
                    gst: 1,
                    address: 1,
                    state: 1,
                    pincode: 1,
                    business: 1
                }
            }
        ]
    )
    result = data.map((ref) => {
        return {
            _id: ref.id,
            party: ref.party,
            address: ref.address,
            business: ref.business,
            reference: ref.reference,
            state: ref.state,
            status: 'open',
            last_remark: ""
        }
    })
    return res.status(200).json(result)
}

export const BulkCreateAndUpdateReferenceFromExcel = async (req: Request, res: Response, next: NextFunction) => {
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
            if (!state) {
                validated = false
                statusText = "state required"
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
                    let oldref = await Reference.findOne({ state: state.toLowerCase(), party: party.toLowerCase(), reference: item.reference.toLowerCase(), date: nedate, sale_scope: sale_scope })
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

export const DownloadExcelTemplateForCreateReferenceReport = async (req: Request, res: Response, next: NextFunction) => {
    let checklist: any[] = [
        {
            _id: 'wwwewew',
            date: '2024-01-12',
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
    const data = await Reference.aggregate(
        [
            {
                $group: {
                    _id: { reference: "$reference", party: "$party", date: "$date" }, // Group by reference, party, and date
                    id: { $first: "$_id" },
                    total_sale_scope: { $sum: "$sale_scope" }, // Summing sale_scope for each group
                    gst: { $first: "$gst" }, // Assuming same GST for each group
                    address: { $first: "$address" }, // Assuming same address for each group
                    state: { $first: "$state" }, // Assuming same state for each group
                    pincode: { $first: "$pincode" }, // Assuming same pincode for each group
                    business: { $first: "$business" }, // Assuming same business for each group
                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$id",
                    reference: "$_id.reference",
                    party: "$_id.party",
                    date: "$_id.date",
                    total_sale_scope: 1,
                    gst: 1,
                    address: 1,
                    state: 1,
                    pincode: 1,
                    business: 1
                }
            }
        ]
    )


    if (data.length > 0)
        checklist = data.map((ref) => {
            return {
                _id: ref.id,
                gst: ref.gst,
                party: ref.party,
                address: ref.address,
                state: ref.state,
                pincode: ref.pincode,
                business: ref.business,
                sale_scope: ref.total_sale_scope,
                reference: ref.reference
            }
        })
    let template: { sheet_name: string, data: any[] }[] = []
    template.push({ sheet_name: 'template', data: checklist })
    ConvertJsonToExcel(template)
    let fileName = "CreateReferenceTemplate.xlsx"
    return res.download("./file", fileName)
}