import mongoose from "mongoose";
import { IChecklistBox, IChecklistRemark, IChecklist } from "../interfaces/ChecklistInterface";


const ChecklistBoxSchema = new mongoose.Schema<IChecklistBox, mongoose.Model<IChecklistBox, {}, {}>, {}>({
    date: { type: Date, required: true },
    stage: { type: String, default: 'open' },
    checklist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Checklist',
        required: true
    },
    last_remark: String,
    score: { type: Number, default: 0 },
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





const ChecklistSchema = new mongoose.Schema<IChecklist, mongoose.Model<IChecklist, {}, {}>, {}>({
    active: {
        type: Boolean,
        default: true,
    },
    serial_no: {
        type: Number,
        unique: true
    },
    last_remark: String,
    work_title: {
        type: String,
        lowercase: true,
        required: true,
        index: true
    },
    condition: {
        type: String,
        trim: true,
        lowercase: true
    },
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
    group_title: {
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

export const ChecklistRemark = mongoose.model<IChecklistRemark, mongoose.Model<IChecklistRemark, {}, {}>>("ChecklistRemark", ChecklistRemarkSchema)

export const ChecklistBox = mongoose.model<IChecklistBox, mongoose.Model<IChecklistBox, {}, {}>>("ChecklistBox", ChecklistBoxSchema)
