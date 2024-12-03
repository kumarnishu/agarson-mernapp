import mongoose from "mongoose"
import { IUser } from "./user"


export type IExpenseCategory = {
    _id: string,
    category: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const ExpenseCategorySchema = new mongoose.Schema<IExpenseCategory, mongoose.Model<IExpenseCategory, {}, {}>, {}>({
    category: {
        type: String,
        index: true,
        trim: true,
        lowercase: true,
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

export const ExpenseCategory = mongoose.model<IExpenseCategory, mongoose.Model<IExpenseCategory, {}, {}>>("ExpenseCategory", ExpenseCategorySchema)