import mongoose from "mongoose"
import { IUser } from "./user.model"
import { IItemUnit } from "./item-unit.model"
import { IExpenseCategory } from "./expense-category.model"


export type IExpenseItem = {
    _id: string,
    item: string,
    unit: IItemUnit,
    stock: number,
    to_maintain_stock:boolean,
    category: IExpenseCategory
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const ExpenseItemSchema = new mongoose.Schema<IExpenseItem, mongoose.Model<IExpenseItem, {}, {}>, {}>({
    item: {
        type: String,
        index: true,
        lowercase: true,
        required: true
    },
    unit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemUnit',
        required: true
    },
    to_maintain_stock: {
        type: Boolean,
        default: true
    },
    stock: {
        type: Number, default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExpenseCategory',
        required: true
    },
    created_at: {
        type: Date,
        default: new Date(),
        required: true,

    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updated_at: {
        type: Date,
        default: new Date(),
        required: true,

    },

    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

export const ExpenseItem = mongoose.model<IExpenseItem, mongoose.Model<IExpenseItem, {}, {}>>("ExpenseItem", ExpenseItemSchema)