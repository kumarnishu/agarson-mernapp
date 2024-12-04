import mongoose from "mongoose";
import { Asset, IUser } from "./user.model";
import { IPayment } from "./payment.model";

export type IPaymentDocument = {
    _id: string,
    remark: string,
    document: Asset,
    payment: IPayment,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


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


export const PaymentDocument = mongoose.model<IPaymentDocument, mongoose.Model<IPaymentDocument, {}, {}>>("PaymentDocument", PaymentDocumentSchema)