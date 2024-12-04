import mongoose from "mongoose"
import { IUser } from "./user.model"


export type IItemUnit = {
    _id: string,
    unit: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const ItemUnitSchema = new mongoose.Schema<IItemUnit, mongoose.Model<IItemUnit, {}, {}>, {}>({
    unit: {
        type: String,
        index: true,
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

export const ItemUnit = mongoose.model<IItemUnit, mongoose.Model<IItemUnit, {}, {}>>("ItemUnit", ItemUnitSchema)