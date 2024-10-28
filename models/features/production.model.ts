import mongoose from "mongoose"
import { IMachine } from "../dropdown/machine.model"
import { IUser } from "./user.model"
import { IArticle } from "../dropdown/article.model"


export type IProduction = {
    _id: string,
    machine: IMachine,
    thekedar: IUser,
    articles: IArticle[],
    manpower: number,
    production: number,
    big_repair: number,
    upper_damage: number,
    small_repair: number,
    date: Date,
    production_hours: number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const ProductionSchema = new mongoose.Schema<IProduction, mongoose.Model<IProduction, {}, {}>, {}>({
    machine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        required: true
    },
    thekedar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    articles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article',
            required: true
        }
    ],
    date: { type: Date, required: true },
    production_hours: Number,
    manpower: Number,
    production: Number,
    big_repair: Number,
    upper_damage: Number,
    small_repair: Number,
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

export const Production = mongoose.model<IProduction, mongoose.Model<IProduction, {}, {}>>("Production", ProductionSchema)