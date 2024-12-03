import mongoose from "mongoose"
import { IUser } from "./user"

export type IExpenseLocation = {
    _id: string,
    name: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const ExpenseLocationSchema = new mongoose.Schema<IExpenseLocation, mongoose.Model<IExpenseLocation, {}, {}>, {}>({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
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

export const ExpenseLocation = mongoose.model<IExpenseLocation, mongoose.Model<IExpenseLocation, {}, {}>>("ExpenseLocation", ExpenseLocationSchema)