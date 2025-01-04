import mongoose from "mongoose";
import { Asset, IUser } from "./user.model";
import { IStockScheme } from "./stock-schme.model";

export type IConsumedStock = {
    _id: string,
    party: string,
    scheme: IStockScheme,
    size: number,//six,seven,eight,nine,ten
    article: string,
    consumed: number
    employee: IUser,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const ConsumedStockSchema = new mongoose.Schema<IConsumedStock, mongoose.Model<IConsumedStock, {}, {}>, {}>({
    party: {
        type: String, default: 'NA'
    },
    size: {
        type: Number,
        required: true
    },
    article: {
        type: String,
        default: 'NA',
        required: true
    },
    consumed: {
        type: Number,
        default: 0
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    scheme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StockScheme',
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

export const ConsumedStock = mongoose.model<IConsumedStock, mongoose.Model<IConsumedStock, {}, {}>>("ConsumedStock", ConsumedStockSchema)
