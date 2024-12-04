import { NextFunction, Request, Response } from "express"
import { CreateOrEditExpenseItem, DropDownDto, GetExpenseItemDto, GetExpenseItemFromExcelDto } from "../../dtos"
import { ExpenseItem, IExpenseItem } from "../../models/expense-item"
import isMongoId from "validator/lib/isMongoId"
import { ExpenseCategory } from "../../models/expense-category"
import { ItemUnit } from "../../models/item-unit"
import ConvertJsonToExcel from "../../utils/ConvertJsonToExcel"
import xlsx from "xlsx"


export const GetAllExpenseItems = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetExpenseItemDto[] = []
    let items: IExpenseItem[] = []
    items = await ExpenseItem.find().populate('unit').populate('category').sort('item')
    result = items.map((item) => {
        return {
            _id: item._id,
            item: item.item,
            stock: item.stock,
            to_maintain_stock:item.to_maintain_stock,
            unit: { id: item.unit._id, label: item.unit.unit, value: item.unit.unit },
            category: { id: item.category._id, label: item.category.category, value: item.category.category },
        }
    })
    return res.status(200).json(result)
}

export const GetAllExpenseItemsForDropDown = async (req: Request, res: Response, next: NextFunction) => {
    let result: DropDownDto[] = []
    let items: IExpenseItem[] = []
    items = await ExpenseItem.find().populate('unit').sort('item')
    result = items.map((item) => {
        return {
            id: item._id,
            label: item.item,
            value: item.item
        }
    })
    return res.status(200).json(result)
}

export const CreateExpenseItem = async (req: Request, res: Response, next: NextFunction) => {
    const { item, unit, category, stock, to_maintain_stock } = req.body as CreateOrEditExpenseItem
    if (!item || !unit || !category) {
        return res.status(400).json({ message: "please provide required fields" })
    }

    if (await ExpenseItem.findOne({ item: item.toLowerCase(), category: category }))
        return res.status(400).json({ message: "already exists this item" })
    let result = await new ExpenseItem({
        item: item,
        unit,
        stock,
        category,
        to_maintain_stock,
        created_at: new Date(),
        created_by: req.user,
        updated_at: new Date(),
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}

export const UpdateExpenseItem = async (req: Request, res: Response, next: NextFunction) => {
    const { item, unit, category, stock } = req.body as CreateOrEditExpenseItem
    if (!item || !item || !category) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let olditem = await ExpenseItem.findById(id)
    if (!olditem)
        return res.status(404).json({ message: "item not found" })
    if (item !== olditem.item)
        if (await ExpenseItem.findOne({ item: item.toLowerCase(), category: category }))
            return res.status(400).json({ message: "already exists this item" })
    await ExpenseItem.findByIdAndUpdate(id, {
        item, unit, category, stock, updated_at: new Date(),
        updated_by: req.user
    })
    return res.status(200).json(olditem)

}
export const DeleteExpenseItem = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "item id not valid" })
    let item = await ExpenseItem.findById(id);
    if (!item) {
        return res.status(404).json({ message: "item not found" })
    }

    await ExpenseItem.findByIdAndDelete(id);

    return res.status(200).json({ message: "item deleted successfully" })
}

export const BulkCreateAndUpdateExpenseItemFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetExpenseItemFromExcelDto[] = []
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
        let workbook_response: GetExpenseItemFromExcelDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );

        if (workbook_response.length > 3000) {
            return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
        }

        for (let i = 0; i < workbook_response.length; i++) {
            let data = workbook_response[i]
            let item: string | null = String(data.item)
            let unit: string | null = String(data.unit)
            let stock: number | null = data.unit && Number(data.unit) || 0
            let category: string | null = String(data.category)
            let to_maintain_stock: boolean | null = data.to_maintain_stock
            let isValidated = true;
            if (!category) {
                statusText = "category required"
                isValidated = false
            }
            if (!unit) {
                statusText = "unit required"
                isValidated = false
            }
            let cat = await ExpenseCategory.findOne({ category: category })
            if (!cat) {
                statusText = "category not found"
                isValidated = false
            }
            let un = await ItemUnit.findOne({ unit: unit })
            if (!un) {
                statusText = "unit not found"
                isValidated = false
            }
            if (isValidated) {
                if (data._id && isMongoId(String(data._id))) {
                    let olditem = await ExpenseItem.findById(data._id)
                    if (olditem) {
                        if (item !== olditem.item)
                            if (!await ExpenseItem.findOne({ item: item.toLowerCase(), category: cat })) {

                                olditem.item = item
                                // olditem.to_maintain_stock = to_maintain_stock
                                // olditem.stock = stock
                                if (cat)
                                    olditem.category = cat
                                if (un)
                                    olditem.unit = un
                                olditem.updated_at = new Date()
                                if (req.user)
                                    olditem.updated_by = req.user
                                await olditem.save()
                                statusText = "updated"

                            }
                    }
                }

                if (!data._id || !isMongoId(String(data._id))) {
                    let olditem = await ExpenseItem.findOne({ item: item.toLowerCase(), category: cat })
                    if (!olditem) {
                        await new ExpenseItem({
                            item: item,
                            category: cat,
                            unit: un,
                            to_maintain_stock,
                            stock: stock,
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
                ...data,
                status: statusText
            })
        }


    }
    return res.status(200).json(result);
}

export const DownloadExcelTemplateForCreateExpenseItem = async (req: Request, res: Response, next: NextFunction) => {
    let checklists: GetExpenseItemFromExcelDto[] = [{
        _id: 'hwhii',
        item: 'belt',
        unit: 'kg',
        to_maintain_stock:false,
        category: 'GUMBOOT',
        stock: 5
    }]


    let categories = (await ExpenseCategory.find()).map((u) => { return { name: u.category } })
    let units = (await ItemUnit.find()).map((i) => { return { unit: i.unit } })

    let template: { sheet_name: string, data: any[] }[] = []
    template.push({ sheet_name: 'template', data: checklists })
    template.push({ sheet_name: 'categories', data: categories })
    template.push({ sheet_name: 'unit', data: units })
  
    ConvertJsonToExcel(template)
    let fileName = "CreateExpenseItemTemplate.xlsx"
    return res.download("./file", fileName)
}