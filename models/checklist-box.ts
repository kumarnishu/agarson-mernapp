import mongoose from "mongoose";
import { IChecklist } from "./checklist";
import { IUser } from "./user";


export type IChecklistBox = {
    _id: string,
    date: Date,
    remarks: string,
    checked: boolean,
    checklist: IChecklist,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const ChecklistBoxSchema = new mongoose.Schema<IChecklistBox, mongoose.Model<IChecklistBox, {}, {}>, {}>({
    date: { type: Date, required: true },
    checked: { type: Boolean, default: false },
    remarks: String,
    checklist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Checklist',
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


export const ChecklistBox = mongoose.model<IChecklistBox, mongoose.Model<IChecklistBox, {}, {}>>("ChecklistBox", ChecklistBoxSchema)