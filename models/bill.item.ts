import mongoose from "mongoose"
import { IUser } from "../users/user.model"
import { IArticle } from "../production/article.model"
import { IBill } from "./crm-bill"


export type IBillItem = {
    _id: string,
    article: IArticle,
    qty: number,
    rate: number,
    bill: IBill,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

const BillItemSchema = new mongoose.Schema<IBillItem, mongoose.Model<IBillItem, {}, {}>, {}>({
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true
    },
    bill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IBill',
        required: true
    },
    qty: Number,
    rate: Number,
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

export const BillItem = mongoose.model<IBillItem, mongoose.Model<IBillItem, {}, {}>>("BillItem", BillItemSchema)