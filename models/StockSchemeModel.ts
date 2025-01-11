import mongoose from "mongoose"
import { IConsumedStock, IStockScheme, IArticleStock } from "../interfaces/StockSchemeInterface"



const ConsumedStockSchema = new mongoose.Schema<IConsumedStock, mongoose.Model<IConsumedStock, {}, {}>, {}>({
    rejected: { type: Boolean, default: false },
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
export const StockScheme = mongoose.model<IStockScheme, mongoose.Model<IStockScheme, {}, {}>>("StockScheme", StockSchema)
export const ConsumedStock = mongoose.model<IConsumedStock, mongoose.Model<IConsumedStock, {}, {}>>("ConsumedStock", ConsumedStockSchema)