import mongoose from "mongoose";
import { IChecklistCategory } from "./checklist-category";
import { Asset, IUser } from "./user";


export type IChecklist = {
    _id: string,
    active: boolean
    work_title: string,
    work_description: string,
    photo: Asset,
    assigned_users: IUser[],
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
        type:Boolean,
        default: true,
    },
    work_title: {
        type: String,
        lowercase: true,
        required: true
    },
    work_description: {
        type: String,
        lowercase: true,
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
            ref: 'User'
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
