import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import { ExpenseItem, IExpenseItem } from '../models/expense-item.model';
import { ExpenseTransaction, IExpenseTransaction } from '../models/expense-transaction.model';
import { GetExpenseTransactionsDto, IssueOrAddExpenseItemDto } from '../dtos/expense.dto';
import { ExpenseLocation } from '../models/expense-location.model';
import { GetExpenseItemDto } from '../dtos/expense-item.dto';


export const IssueExpenseItem = async (req: Request, res: Response, next: NextFunction) => {
    const { stock, location, remark } = req.body as IssueOrAddExpenseItemDto
    if (!remark || !location) {
        return res.status(400).json({ message: "please fill all required fields" })
    }
    const id = req.params.id
    let olditem = await ExpenseItem.findById(id)
    if (!olditem)
        return res.status(404).json({ message: "item not found" })
    if (olditem.to_maintain_stock && stock == 0)
        return res.status(404).json({ message: "stock should be more than 0" })
    let store = await ExpenseLocation.findOne({ name: "store" })
    if (!store)
        return res.status(404).json({ messgae: "store not exists" })
    await ExpenseItem.findByIdAndUpdate(id, {
        stock: olditem.stock - stock || 0,
        last_remark: remark,
        updated_at: new Date(),
        updated_by: req.user
    })

    await new ExpenseTransaction({
        item: olditem,
        location: store,
        remark: remark,
        outWardQty: stock,
        inWardQty: 0,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    await new ExpenseTransaction({
        item: olditem,
        location: location,
        remark: remark,
        outWardQty: 0,
        inWardQty: stock,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(200).json(olditem)
}

export const AddExpenseItem = async (req: Request, res: Response, next: NextFunction) => {
    const { stock, location, remark } = req.body as IssueOrAddExpenseItemDto
    console.log(req.body)
    if (!location || !remark) {
        return res.status(400).json({ message: "please fill all required fields" })
    }
    const id = req.params.id
    let olditem = await ExpenseItem.findById(id)
    if (!olditem)
        return res.status(404).json({ message: "item not found" })
    if (!olditem.to_maintain_stock) {
        return res.status(404).json({ message: "not allowed to add stock" })
    }
    if (stock <= 0)
        return res.status(400).json({ message: "provide stock" })
    let store = await ExpenseLocation.findOne({ name: "store" })
    if (!store)
        return res.status(404).json({ messgae: "store not exists" })

    await ExpenseItem.findByIdAndUpdate(id, {
        stock: Number(olditem.stock) + Number(stock || 0),
        updated_at: new Date(), last_remark: remark,
        updated_by: req.user
    })
    await new ExpenseTransaction({
        item: olditem,
        location: store,
        remark: remark,
        outWardQty: 0,
        inWardQty: stock || 0,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    await new ExpenseTransaction({
        item: olditem,
        location: location,
        remark: remark,
        outWardQty: stock || 0,
        inWardQty: 0,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(200).json(olditem)
}

export const GetAllExpenseStore = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetExpenseItemDto[] = []
    let items: IExpenseItem[] = []
    items = await ExpenseItem.find().populate('unit').populate('category').sort('item')
    result = items.map((item) => {
        return {
            _id: item._id,
            item: item.item,
            price: item.price,
            pricetolerance: item.pricetolerance,
            stock_limit: item.stock_limit,
            stock: item.stock,
            last_remark: "",
            to_maintain_stock: item.to_maintain_stock,
            unit: { id: item.unit._id, label: item.unit.unit, value: item.unit.unit },
            category: { id: item.category._id, label: item.category.category, value: item.category.category },
        }
    })
    return res.status(200).json(result)
}

export const GetAllExpenseTransactions = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetExpenseTransactionsDto[] = []
    let items: IExpenseTransaction[] = []
    items = await ExpenseTransaction.find().populate({
        path: 'item',
        populate: [
            {
                path: 'unit',
                model: 'ItemUnit'
            },
            {
                path: 'category',
                model: 'ExpenseCategory'
            }
        ]
    }).populate('created_by').populate('location').sort('-created_at')

    result = items.map((item) => {
        return {
            _id: item._id,
            item: { id: item.item._id, label: item.item.item, value: item.item.item },
            category: { id: item.item.category._id, label: item.item.category.category },
            unit: { id: item.item.unit._id, label: item.item.unit.unit },
            price: item.item.price,
            location: { id: item.location._id, label: item.location.name, value: item.location.name },
            remark: item.remark,
            inWardQty: item.inWardQty,
            outWardQty: item.outWardQty,
            created_by: { id: item.created_by._id, label: item.created_by.username, value: item.item.created_by.username },
            created_at: moment(new Date()).format("llll")
        }
    })
    return res.status(200).json(result)
}
