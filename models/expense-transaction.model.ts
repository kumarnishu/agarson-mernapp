import mongoose from "mongoose"
import { IUser } from "./user.model"
import { IExpenseItem } from "./expense-item.model"
import { IExpenseLocation } from "./expense-location.model"


export type IExpenseTransaction = {
    _id: string,
    item: IExpenseItem,
    location: IExpenseLocation,
    remark: string,
    inWardQty: number,
    outWardQty: number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const ExpenseTransactionSchema = new mongoose.Schema<IExpenseTransaction, mongoose.Model<IExpenseTransaction, {}, {}>, {}>({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExpenseItem',
        required: true
    },
    remark: String,
    inWardQty: { type: Number, default: 0 },
    outWardQty: { type: Number, default: 0 },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExpenseLocation',
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

export const ExpenseTransaction = mongoose.model<IExpenseTransaction, mongoose.Model<IExpenseTransaction, {}, {}>>("ExpenseTransaction", ExpenseTransactionSchema)