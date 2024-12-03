import mongoose from "mongoose"
import { IUser } from "./user"
import { IExpenseItem } from "./expense-item"


export type IExpenseTransactions = {
    _id: string,
    item: IExpenseItem,
    from: string,
    to: string,
    movement: string,
    qty: number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const ExpenseTransactionsSchema = new mongoose.Schema<IExpenseTransactions, mongoose.Model<IExpenseTransactions, {}, {}>, {}>({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExpenseItem',
        required: true
    },
    movement: {
        type: String,
        lowercase: true,
        trim: true
    },
    qty:Number,
    from: String,
    to: String,
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

export const ExpenseTransactions = mongoose.model<IExpenseTransactions, mongoose.Model<IExpenseTransactions, {}, {}>>("ExpenseTransactions", ExpenseTransactionsSchema)