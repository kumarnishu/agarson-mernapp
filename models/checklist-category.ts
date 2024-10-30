import mongoose from "mongoose";
import {  IUser } from "./user";

export type IChecklistCategory = {
    _id: string,
    category: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

const ChecklistCategorySchema = new mongoose.Schema<IChecklistCategory, mongoose.Model<IChecklistCategory, {}, {}>, {}>({
    category: {
        type: String,
        lowercase: true,
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


export const ChecklistCategory = mongoose.model<IChecklistCategory, mongoose.Model<IChecklistCategory, {}, {}>>("ChecklistCategory", ChecklistCategorySchema)
