import mongoose from "mongoose";
import { IChecklistCategory } from "./checklist-category.model";
import { Asset, IUser } from "./user.model";
import { IChecklistBox } from "./checklist-box.model";


export type IChecklist = {
    _id: string,
    active: boolean
    work_title: string,
    condition: string // 'check-blank'||'check_yesno'||'check_expected_number',
    expected_number: number,
    work_description: string,
    last_remark: string,
    subchecklists: IChecklist[],
    photo: Asset,
    serial_no: string,
    assigned_users: IUser[],
    last_10_boxes: IChecklistBox[]
    lastcheckedbox: IChecklistBox,
    checklist_boxes: IChecklistBox[]
    link: string,
    category: IChecklistCategory,
    frequency: string,
    next_date: Date,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const ChecklistSchema = new mongoose.Schema<IChecklist, mongoose.Model<IChecklist, {}, {}>, {}>({
    active: {
        type: Boolean,
        default: true,
    },
    serial_no: {
        type: String,
        lowercase: true,
        index: true
    },
    last_remark: String,
    work_title: {
        type: String,
        lowercase: true,
        required: true,
        index: true
    },
    condition: String,
    expected_number: { type: Number, default: 0 },
    last_10_boxes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ChecklistBox'
        }
    ],
    lastcheckedbox: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChecklistBox'
    },
    checklist_boxes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChecklistBox',
        index: false
    }],
    work_description: {
        type: String,
        index: true
    },
    link: {
        type: String,
    },
    frequency: {
        type: String,
        lowercase: true,
        required: true
    },
    next_date: {
        type: Date
    },
    photo: {
        _id: { type: String },
        filename: { type: String },
        public_url: { type: String },
        content_type: { type: String },
        size: { type: String },
        bucket: { type: String },
        created_at: Date
    },
    category:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChecklistCategory',
        required: true
    },
    assigned_users:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true
        }]
    ,
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

export const Checklist = mongoose.model<IChecklist, mongoose.Model<IChecklist, {}, {}>>("Checklist", ChecklistSchema)
