import { Response, Request, NextFunction } from "express"
import moment from "moment"
import xlsx from 'xlsx';
import { IConsumedStock, IArticleStock } from "../interfaces/StockSchemeInterface"
import { ConsumedStock, ArticleStock, StockScheme } from "../models/StockSchemeModel"
import ConvertJsonToExcel from "../services/ConvertJsonToExcel"
import { CreateConsumeStockDto, DiscardConsumptionDto, CreateArticleStockExcelDto } from "../dtos/request/StockSchemeDto";
import { GetConsumedStockDto, GetArticleStockDto } from "../dtos/response/StockSchemeDto";


export class StockSchemeController {
    public async GetAllConsumedStocks(req: Request, res: Response, next: NextFunction) {
        let result: GetConsumedStockDto[] = []
        let items: IConsumedStock[] = []
        let rejected = req.query.rejected
        if (req.user.is_admin)
            items = await ConsumedStock.find({ rejected: rejected == 'true' }).populate('scheme').populate('employee').populate('created_by').populate('updated_by').sort('-created_at')
        else
            items = await ConsumedStock.find({ rejected: rejected == 'true', employee: req.user._id }).populate('scheme').populate('employee').populate('created_by').populate('updated_by').sort('-created_at')

        result = items.map((item) => {
            return {
                _id: item._id,
                status: item.rejected ? "rejected" : "received",
                scheme: { id: item.scheme._id, label: item.scheme.scheme },
                party: item.party,
                article: item.article,
                size: item.size,
                consumed: item.consumed,
                employee: { id: item.employee._id, label: item.employee.username },
                created_at: moment(item.created_at).calendar(),
                updated_at: moment(item.updated_at).calendar(),
                created_by: { id: item.created_by._id, label: item.created_by.username },
                updated_by: { id: item.updated_by._id, label: item.updated_by.username }
            }
        })
        return res.status(200).json(result)
    }
    public async ConsumeStock(req: Request, res: Response, next: NextFunction) {
        try {
            const { article, size, consumed, party, scheme } = req.body as CreateConsumeStockDto;

            // Validate required fields
            if (!article || !size || !consumed || !party || !scheme) {
                return res.status(400).json({ message: "Please provide required fields." });
            }

            // Validate stock dynamically based on size
            const sizeMap: { [key: number]: string } = {
                6: 'six',
                7: 'seven',
                8: 'eight',
                9: 'nine',
                10: 'ten',
                11: 'eleven'
            };

            const sizeField = sizeMap[size];
            if (!sizeField) {
                return res.status(400).json({ message: "Invalid size provided." });
            }

            const stock = await ArticleStock.findOne({
                article,
                scheme: scheme,
                [sizeField]: { $gt: 0 }
            });

            if (!stock) {
                return res.status(400).json({ message: `Sorry! Stock of ${article} in size ${size} is not available ${scheme}.` });
            }

            // Record stock consumption
            await new ConsumedStock({
                article,
                scheme,
                party,
                size,
                consumed,
                employee: req.user,
                created_at: new Date(),
                created_by: req.user,
                updated_at: new Date(),
                updated_by: req.user
            }).save();

            if (stock) {
                if (size == 6) { stock.six = stock.six - consumed; await stock.save() }
                if (size == 7) { stock.seven = stock.seven - consumed; await stock.save() }
                if (size == 8) { stock.eight = stock.eight - consumed; await stock.save() }
                if (size == 9) { stock.nine = stock.nine - consumed; await stock.save() }
                if (size == 10) { stock.ten = stock.ten - consumed; await stock.save() }
                if (size == 11) { stock.eleven = stock.eleven - consumed; await stock.save() }
            }
            return res.status(201).json({ message: "Success" });

        } catch (error) {
            next(error); // Pass error to global error handler
        }
    }
    public async GetAllArticleStocks(req: Request, res: Response, next: NextFunction) {
        let result: GetArticleStockDto[] = []
        let items: IArticleStock[] = []
        items = await ArticleStock.find().populate('scheme').populate('created_by').populate('updated_by').sort('article')

        result = items.map((item) => {
            return {
                _id: item._id,
                scheme: { id: item.scheme._id, label: item.scheme.scheme },
                six: item.six,
                seven: item.seven,
                eight: item.eight,
                nine: item.nine,
                ten: item.ten,
                eleven: item.eleven,
                article: item.article,
                created_at: moment(item.created_at).format('YYYY-MM-DD'),
                updated_at: moment(item.updated_at).format('YYYY-MM-DD'),
                created_by: { id: item.created_by._id, label: item.created_by.username },
                updated_by: { id: item.updated_by._id, label: item.updated_by.username }
            }
        })
        return res.status(200).json(result)
    }
    public async DisacardConsumption(req: Request, res: Response, next: NextFunction) {
        try {
            const { article, size, consumed, scheme } = req.body as DiscardConsumptionDto;

            // Validate required fields
            if (!article || !size || !consumed || !scheme) {
                return res.status(400).json({ message: "Please provide required fields." });
            }

            // Validate stock dynamically based on size
            const sizeMap: { [key: number]: string } = {
                6: 'six',
                7: 'seven',
                8: 'eight',
                9: 'nine',
                10: 'ten',
                11: 'eleven'
            };

            const sizeField = sizeMap[size];
            if (!sizeField) {
                return res.status(400).json({ message: "Invalid size provided." });
            }

            const stock = await ArticleStock.findOne({
                article,
                scheme: scheme
            });

            if (!stock) {
                return res.status(400).json({ message: `Sorry! Scheme ${scheme} of ${article} in size ${size}  is not available.` });
            }

            let id = req.params.id
            let consumption = await ConsumedStock.findById(id)
            if (!consumption) {
                return res.status(404).json({ message: "consumption not exists" })
            }
            consumption.rejected = true
            await consumption.save()

            if (stock) {
                if (size == 6) { stock.six = stock.six + consumed; await stock.save() }
                if (size == 7) { stock.seven = stock.seven + consumed; await stock.save() }
                if (size == 8) { stock.eight = stock.eight + consumed; await stock.save() }
                if (size == 9) { stock.nine = stock.nine + consumed; await stock.save() }
                if (size == 10) { stock.ten = stock.ten + consumed; await stock.save() }
                if (size == 11) { stock.eleven = stock.eleven + consumed; await stock.save() }
            }
            return res.status(201).json({ message: "Success" });

        } catch (error) {
            next(error); // Pass error to global error handler
        }
    }
    public async CreateArticleStocksFromExcel(req: Request, res: Response, next: NextFunction) {
        let result: CreateArticleStockExcelDto[] = []
        let statusText = ""
        let { scheme } = req.body as { scheme: string }
        console.log(scheme)
        if (!scheme)
            return res.status(400).json({ message: "please provide a scheme" })
        if (await StockScheme.findOne({ scheme: scheme.trim().toLowerCase() }))
            return res.status(400).json({ message: "scheme already exists" })

        let newSchme = await new StockScheme({ scheme: scheme, created_by: req.user, updated_by: req.user, created_at: new Date(Date.now()), updated_at: new Date(Date.now()) }).save()
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
            let workbook_response: CreateArticleStockExcelDto[] = xlsx.utils.sheet_to_json(
                workbook.Sheets[workbook_sheet[0]]
            );
            if (workbook_response.length > 3000) {
                return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
            }
            await ArticleStock.deleteMany({})
            for (let i = 0; i < workbook_response.length; i++) {
                let item = workbook_response[i]
                let article: string | null = item.article
                let six: number | null = item.six
                let seven: number | null = item.seven
                let eight: number | null = item.eight
                let nine: number | null = item.nine
                let ten: number | null = item.ten
                let eleven: number | null = item.eleven

                let validated = true

                //important
                if (!article) {
                    validated = false
                    statusText = "required article"
                }


                if (validated) {
                    await new ArticleStock({
                        article,
                        scheme: newSchme,
                        six,
                        seven,
                        eight,
                        nine,
                        ten,
                        eleven,
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
        let checklists: CreateArticleStockExcelDto[] = [{
            article: 'power',
            six: 69,
            seven: 47,
            eight: 48,
            nine: 95,
            ten: 23,
            eleven: 22
        }]
        let template: { sheet_name: string, data: any[] }[] = []
        template.push({ sheet_name: 'template', data: checklists })
        ConvertJsonToExcel(template)
        let fileName = "CreateArticleStockTemplate.xlsx"
        return res.download("./file", fileName)
    }
}