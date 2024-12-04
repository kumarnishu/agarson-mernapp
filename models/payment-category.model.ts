import mongoose from "mongoose";
import { IUser } from "./user.model";

export type IPaymentCategory = {
    _id: string,
    category: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

const PaymentCategorySchema = new mongoose.Schema<IPaymentCategory, mongoose.Model<IPaymentCategory, {}, {}>, {}>({
    category: {
        type: String,
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


export const PaymentCategory = mongoose.model<IPaymentCategory, mongoose.Model<IPaymentCategory, {}, {}>>("PaymentCategory", PaymentCategorySchema)
