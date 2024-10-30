import mongoose from "mongoose";
import { Asset, IUser } from "../users/user.model";

export type IChecklistCategory = {
    _id: string,
    category: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

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