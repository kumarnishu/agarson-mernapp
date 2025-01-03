import { Response, Request, NextFunction } from "express"
import moment from "moment"
import { ConsumeStockSchemeDto, GetStockSchemeConsumedDto, GetStockSchemeDto, getStockSchemeExcelDto } from "../dtos/stock.scheme.dto"
import { ArticleStockScheme, IArticleStockScheme } from "../models/stock-scheme.model"
import ConvertJsonToExcel from "../services/ConvertJsonToExcel"
import xlsx from "xlsx"
import { IStockConsumedForScheme, StockConsumedForScheme } from "../models/stock-consumed.model"

export class StockSchemeController {
    //leave approved controller
    public async GetAllConsumedStockSchemes(req: Request, res: Response, next: NextFunction) {
        let result: GetStockSchemeConsumedDto[] = []
        let items: IStockConsumedForScheme[] = []

        items = await StockConsumedForScheme.find({ employee: req.user._id }).populate('employee').populate('created_by').populate('updated_by').sort('-created_at')

        result = items.map((item) => {
            return {
                _id: item._id,
                party: item.party,
                article: item.article,
                size: item.size,
                consumed: item.consumed,
                employee: { id: item.employee._id, label: item.employee.username },
                created_at: moment(item.created_at).format('YYYY-MM-DD'),
                updated_at: moment(item.updated_at).format('YYYY-MM-DD'),
                created_by: { id: item.created_by._id, label: item.created_by.username },
                updated_by: { id: item.updated_by._id, label: item.updated_by.username }
            }
        })
        return res.status(200).json(result)
    }
    public async ConsumeStockScheme(req: Request, res: Response, next: NextFunction) {
        try {
            const { article, size, consumed } = req.body as ConsumeStockSchemeDto;

            // Validate required fields
            if (!article || !size || !consumed) {
                return res.status(400).json({ message: "Please provide required fields." });
            }

            // Validate stock dynamically based on size
            const sizeMap: { [key: number]: string } = {
                6: 'six',
                7: 'seven',
                8: 'eight',
                9: 'nine',
                10: 'ten'
            };

            const sizeField = sizeMap[size];
            if (!sizeField) {
                return res.status(400).json({ message: "Invalid size provided." });
            }

            const stock = await ArticleStockScheme.findOne({
                article,
                [sizeField]: { $gt: 0 }
            });

            if (!stock) {
                return res.status(400).json({ message: `Sorry! Stock of ${article} in size ${size} is not available.` });
            }

            // Record stock consumption
            await new StockConsumedForScheme({
                article,
                size,
                consumed,
                employee: req.user,
                created_at: new Date(),
                created_by: req.user,
                updated_at: new Date(),
                updated_by: req.user
            }).save();
            let balance = await ArticleStockScheme.findOne({ article: article, size: size })
            if (balance) {
                switch (size) {
                    case 6: { balance.six = balance.six - consumed; await balance.save() }
                    case 7: { balance.seven = balance.seven - consumed; await balance.save() }
                    case 8: { balance.eight = balance.eight - consumed; await balance.save() }
                    case 9: { balance.nine = balance.nine - consumed; await balance.save() }
                    case 10: { balance.ten = balance.ten - consumed; await balance.save() }
                    default: { }
                }
            }
            return res.status(201).json({ message: "Success" });

        } catch (error) {
            next(error); // Pass error to global error handler
        }
    }

    //leave balance controller
    public async GetAllStockSchemes(req: Request, res: Response, next: NextFunction) {
        let result: GetStockSchemeDto[] = []
        let items: IArticleStockScheme[] = []
        items = await ArticleStockScheme.find().populate('created_by').populate('updated_by').sort('article')

        result = items.map((item) => {
            return {
                _id: item._id,
                six: item.six,
                seven: item.seven,
                eight: item.eight,
                nine: item.nine,
                ten: item.ten,
                article: item.article,
                created_at: moment(item.created_at).format('YYYY-MM-DD'),
                updated_at: moment(item.updated_at).format('YYYY-MM-DD'),
                created_by: { id: item.created_by._id, label: item.created_by.username },
                updated_by: { id: item.updated_by._id, label: item.updated_by.username }
            }
        })
        return res.status(200).json(result)
    }

    public async CreateStockSchemeFromExcel(req: Request, res: Response, next: NextFunction) {
        let result: getStockSchemeExcelDto[] = []
        let statusText = ""
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
            let workbook_response: getStockSchemeExcelDto[] = xlsx.utils.sheet_to_json(
                workbook.Sheets[workbook_sheet[0]]
            );
            if (workbook_response.length > 3000) {
                return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
            }

            for (let i = 0; i < workbook_response.length; i++) {
                let item = workbook_response[i]
                let items: IArticleStockScheme[] = []
                let article: string | null = item.article
                let six: number | null = item.six
                let seven: number | null = item.seven
                let eight: number | null = item.eight
                let nine: number | null = item.nine
                let ten: number | null = item.ten

                let validated = true

                //important
                if (!article) {
                    validated = false
                    statusText = "required article"
                }


                if (validated) {
                    await new ArticleStockScheme({
                        article,
                        six,
                        seven,
                        eight,
                        nine,
                        ten,
                        created_by: req.user,
                        updated_by: req.user,
                        updated_at: new Date(Date.now()),
                        created_at: new Date(Date.now())
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
    public async DownloadExcelTemplateForCreateStockScheme(req: Request, res: Response, next: NextFunction) {
        let checklists: getStockSchemeExcelDto[] = [{
            article: 'power',
            six: 69,
            seven: 47,
            eight: 48,
            nine: 95,
            ten: 23
        }]
        let template: { sheet_name: string, data: any[] }[] = []
        template.push({ sheet_name: 'template', data: checklists })
        ConvertJsonToExcel(template)
        let fileName = "CreateStockSchemeTemplate.xlsx"
        return res.download("./file", fileName)
    }
}