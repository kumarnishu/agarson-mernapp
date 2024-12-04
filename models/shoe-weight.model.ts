import mongoose from "mongoose"
import { IArticle } from "./article.model"
import { IDye } from "./dye.model"
import { IMachine } from "./machine.model"
import { Asset, IUser } from "./user.model"

export type IShoeWeight = {
    _id: string,
    machine: IMachine,
    dye: IDye,
    article: IArticle,
    is_validated: boolean,
    month: number,
    shoe_weight1: number,
    shoe_photo1: Asset,
    weighttime1: Date,
    weighttime2: Date,
    weighttime3: Date,
    upper_weight1: number,
    upper_weight2: number,
    upper_weight3: number,
    shoe_weight2: number,
    shoe_photo2: Asset,
    shoe_weight3: number,
    shoe_photo3: Asset,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

const ShoeWeightSchema = new mongoose.Schema<IShoeWeight, mongoose.Model<IShoeWeight, {}, {}>, {}>({
    machine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        required: true
    },
    dye: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dye',
        required: true
    },
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true
    },
    month: Number,
    shoe_weight1: Number,
    upper_weight1: { type: Number, default: 0 },
    upper_weight2: { type: Number, default: 0 },
    upper_weight3: { type: Number, default: 0 },
    shoe_photo1: {
        _id: { type: String },
        filename: { type: String },
        public_url: { type: String },
        content_type: { type: String },
        size: { type: String },
        bucket: { type: String },
        created_at: Date,
    },
    shoe_weight2: Number,
    shoe_photo2: {
        _id: { type: String },
        filename: { type: String },
        public_url: { type: String },
        content_type: { type: String },
        size: { type: String },
        bucket: { type: String },
        created_at: Date,
    },
    shoe_weight3: Number,
    shoe_photo3: {
        _id: { type: String },
        filename: { type: String },
        public_url: { type: String },
        content_type: { type: String },
        size: { type: String },
        bucket: { type: String },
        created_at: Date,
    },
    is_validated: { type: Boolean, default: false },
    weighttime1: Date,
    weighttime2: Date,
    weighttime3: Date,
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

export const ShoeWeight = mongoose.model<IShoeWeight, mongoose.Model<IShoeWeight, {}, {}>>("ShoeWeight", ShoeWeightSchema)