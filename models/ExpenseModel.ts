import mongoose from "mongoose"
import { IExpenseCategory, IExpenseItem, IExpenseLocation, IExpenseTransaction } from "../interfaces/ExpenseInterface"


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
    price: {
        type: Number, default: 0
    },
    pricetolerance: {
        type: Number, default: 0
    },
    stock_limit:{
        type: Number, default: 0
    },
    last_remark: String,
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
export const ExpenseLocation = mongoose.model<IExpenseLocation, mongoose.Model<IExpenseLocation, {}, {}>>("ExpenseLocation", ExpenseLocationSchema)
export const ExpenseItem = mongoose.model<IExpenseItem, mongoose.Model<IExpenseItem, {}, {}>>("ExpenseItem", ExpenseItemSchema)

export const ExpenseCategory = mongoose.model<IExpenseCategory, mongoose.Model<IExpenseCategory, {}, {}>>("ExpenseCategory", ExpenseCategorySchema)
