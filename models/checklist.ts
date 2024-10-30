import mongoose from "mongoose";
import { IChecklistCategory } from "./checklist-category";
import { Asset, IUser } from "./user";


export type IChecklist = {
    _id: string,
    link: string,
    category: IChecklistCategory,
    work_title: string,
    details1: string,
    details2: string,
    photo: Asset,
    user: IUser,
    frequency: string,
    end_date: Date,
    next_date:Date,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const ChecklistSchema = new mongoose.Schema<IChecklist, mongoose.Model<IChecklist, {}, {}>, {}>({
    work_title: {
        type: String,
        lowercase: true,
        required: true
    },
    link: {
        type: String,
    },
    frequency: {
        type: String,
        lowercase: true,
        required: true
    },
    end_date: {
        type: Date,
        default: new Date(),
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
    user:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
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
