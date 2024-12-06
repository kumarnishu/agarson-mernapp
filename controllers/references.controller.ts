import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import ConvertJsonToExcel from "../services/ConvertJsonToExcel";
import { GetReferenceExcelDto } from "../dtos/references.dto";
import isMongoId from "validator/lib/isMongoId";
import { Reference } from "../models/references.model";


export const GetReferencesReport=async (req: Request, res: Response, next: NextFunction) => {
    
}
export const BulkCreateAndUpdateReferenceFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetReferenceExcelDto[] = []
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
            let gst: string | null = String(item.gst)
            let party: string | null = String(item.party)
            let address: string | null = String(item.address)
            let state: string | null = String(item.state)
            let pincode: string | null = String(item.pincode)
            let business: string | null = String(item.business)
            let sale_scope: string | null = String(item.sale_scope)
            let reference: string | null = String(item.reference)


            if (state) {
                if (item._id && isMongoId(String(item._id))) {
                    let tmpitem = await Reference.findById(item._id)
                    if (tmpitem && tmpitem.state !== item.state) {
                        await Reference.findByIdAndUpdate(item._id, {
                            gst: gst,
                            party: party,
                            address: address,
                            state: state,
                            pincode: pincode,
                            business: business,
                            sale_scope: sale_scope,
                            reference: reference,
                            updated_by: req.user,
                            updated_at: new Date()
                        })
                        statusText = "updated"
                    }
                    else {
                         statusText = "duplicate"
                    }

                }

                if (!item._id || !isMongoId(String(item._id))) {
                    let oldref = await Reference.findOne({ party: party.toLowerCase(), reference: item.reference.toLowerCase() })
                    if (!oldref) {
                        await new Reference({
                            gst: gst,
                            party: party,
                            address: address,
                            state: state,
                            pincode: pincode,
                            business: business,
                            sale_scope: sale_scope,
                            reference: reference,
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

export const DownloadExcelTemplateForCreateReferenceReport = async (req: Request, res: Response, next: NextFunction) => {
    let checklist: any[] = [
        {
            _id: 'wwwewew',
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
    let template: { sheet_name: string, data: any[] }[] = []
    template.push({ sheet_name: 'template', data: checklist })
    ConvertJsonToExcel(template)
    let fileName = "CreateReferenceTemplate.xlsx"
    return res.download("./file", fileName)
}