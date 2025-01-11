import mongoose from "mongoose";
import { IPaymentDocument, IPayment } from "../interfaces/PaymentsInterface";



const PaymentDocumentSchema = new mongoose.Schema<IPaymentDocument, mongoose.Model<IPaymentDocument, {}, {}>, {}>({
    remark: {
        type: String,
        lowercase: true,
        required: true
    },
    document: {
        _id: { type: String },
        filename: { type: String },
        public_url: { type: String },
        content_type: { type: String },
        size: { type: String },
        bucket: { type: String },
        created_at: Date
    },

    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
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
export const PaymentDocument = mongoose.model<IPaymentDocument, mongoose.Model<IPaymentDocument, {}, {}>>("PaymentDocument", PaymentDocumentSchema)
