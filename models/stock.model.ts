import mongoose from "mongoose";
import { IUser } from "./user.model";
import { IStockScheme } from "./stock-schme.model";

export type IArticleStock = {
    _id: string,
    six: number,
    scheme:IStockScheme,
    seven: number,
    eight: number,
    nine: number,
    ten: number,
    eleven:number,
    article: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const Schema = new mongoose.Schema<IArticleStock, mongoose.Model<IArticleStock, {}, {}>, {}>({
    six: {
        type: Number,
        default: 0,
        required: true
    },
    seven: {
        type: Number,
        default: 0,
        required: true
    },
    eight: {
        type: Number,
        default: 0,
        required: true
    },
    nine: {
        type: Number,
        default: 0,
        required: true
    },
    ten: {
        type: Number,
        default: 0,
        required: true
    },
    eleven: {
        type: Number,
        default: 0,
        required: true
    },
    scheme:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'StockScheme',
        required: true
    },
    article: String,
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

export const ArticleStock = mongoose.model<IArticleStock, mongoose.Model<IArticleStock, {}, {}>>("ArticleStock", Schema)
