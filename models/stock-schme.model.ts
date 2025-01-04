import mongoose from "mongoose"
import { IUser } from "./user.model"


export type IStockScheme = {
    _id: string,
    scheme: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const StockSchema = new mongoose.Schema<IStockScheme, mongoose.Model<IStockScheme, {}, {}>, {}>({
    scheme: {
        type: String,
        required: true,
        lowercase:true,
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

export const StockScheme = mongoose.model<IStockScheme, mongoose.Model<IStockScheme, {}, {}>>("StockScheme", StockSchema)