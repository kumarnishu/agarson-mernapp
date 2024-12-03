import { NextFunction, Request, Response } from 'express';
import { ExpenseTransactions, IExpenseTransactions } from '../models/expense-transaction';
import { GetExpenseTransactionDto } from '../dtos';
import moment from 'moment';


export const GetAllExpenseTransactions = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetExpenseTransactionDto[] = []
    let items: IExpenseTransactions[] = []
    items = await ExpenseTransactions.find().populate({
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
    }).sort('item')

    result = items.map((item) => {
        return {
            _id: item._id,
            item: { id: item.item._id, label: item.item.item, value: item.item.item },
            category: { id: item.item.category._id, label: item.item.category.category, value: item.item.category.category, },
            unit: { id: item.item.unit._id, label: item.item.unit.unit, value: item.item.unit.unit },
            movement: item.movement,
            from: item.from,
            to: item.to,
            qty: item.qty,
            created_by: { id: item.created_by._id, label: item.created_by.username, value: item.item.created_by.username },
            created_at: moment(new Date()).format("llll")
        }
    })
    return res.status(200).json(result)
}
