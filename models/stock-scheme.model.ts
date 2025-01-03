import mongoose from "mongoose";
import { IUser } from "./user.model";

export type IArticleStockScheme = {
    _id: string,
    six: number,
    seven: number,
    eight: number,
    nine: number,
    ten: number,
    article: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const Schema = new mongoose.Schema<IArticleStockScheme, mongoose.Model<IArticleStockScheme, {}, {}>, {}>({
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

export const ArticleStockScheme = mongoose.model<IArticleStockScheme, mongoose.Model<IArticleStockScheme, {}, {}>>("ArticleStockScheme", Schema)
