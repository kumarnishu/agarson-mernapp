import mongoose from "mongoose";
import { IUser } from "./user";
import { IChecklistBox } from "./checklist-box";

export type IChecklistRemark = {
    _id: string,
    remark: string,
    checklist_box:IChecklistBox,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

const ChecklistRemarkSchema = new mongoose.Schema<IChecklistRemark, mongoose.Model<IChecklistRemark, {}, {}>, {}>({
    remark: {
        type: String,
        lowercase: true,
        required: true
    },
    created_at: {
        type: Date,
        default: new Date(),
        required: true,

    },
    checklist_box: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChecklistBox',
        required: true
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


export const ChecklistRemark = mongoose.model<IChecklistRemark, mongoose.Model<IChecklistRemark, {}, {}>>("ChecklistRemark", ChecklistRemarkSchema)
