import mongoose from "mongoose"
import { IUser } from "./user.model"
import { IDye } from "../dropdown/dye.model"
import { IArticle } from "../dropdown/article.model"

export type ISoleThickness = {
    _id: string,
    dye: IDye,
    article: IArticle,
    size: string,
    left_thickness: number,
    right_thickness: number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

const SoleThicknessSchema = new mongoose.Schema<ISoleThickness, mongoose.Model<ISoleThickness, {}, {}>, {}>({
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
    size: {
        type: String,
        required: true,
        trim: true
    },
    left_thickness: { type: Number, default: 0 },
    right_thickness: { type: Number, default: 0 },
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

export const SoleThickness = mongoose.model<ISoleThickness, mongoose.Model<ISoleThickness, {}, {}>>("SoleThickness", SoleThicknessSchema)