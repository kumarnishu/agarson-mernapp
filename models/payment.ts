import mongoose from "mongoose";
import { IUser } from "./user";
import { IPaymentCategory } from "./payment-category";
import { IPaymentDocument } from "./payment-document";


export type IPayment = {
    _id: string,
    active: boolean
    payment_title: string,
    payment_description: string,
    assigned_users: IUser[],
    lastcheckedpayment: IPaymentDocument,
    payment_documents: IPaymentDocument[],
    due_date: Date,
    link: string,
    category: IPaymentCategory,
    frequency?: string,
    next_date: Date,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const PaymentSchema = new mongoose.Schema<IPayment, mongoose.Model<IPayment, {}, {}>, {}>({
    active: {
        type: Boolean,
        default: true,
    },
    payment_title: {
        type: String,
        lowercase: true,
        required: true
    },
    lastcheckedpayment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentDocument'
    },
    payment_documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentDocument'
    }],
    payment_description: {
        type: String,
        lowercase: true,
    },
    link: {
        type: String,
    },
    frequency: {
        type: String,
        lowercase: true,
        required: true,
        default: 'manual'
    },
    due_date: {
        type: Date,
        required: true
    },
    next_date: {
        type: Date,
    },
    category:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentCategory',
        required: true
    },
    assigned_users:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    ,
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

export const Payment = mongoose.model<IPayment, mongoose.Model<IPayment, {}, {}>>("Payment", PaymentSchema)
