import mongoose from "mongoose"
import { ISampleSystemRemark } from "../interfaces/RemarkInterface"

const SampleSystemRemarkSchema = new mongoose.Schema<ISampleSystemRemark, mongoose.Model<ISampleSystemRemark, {}, {}>, {}>({
    remark: {
        type: String,
        lowercase: true,
        required: true
    },
    next_call:Date,
    created_at: {
        type: Date,
        default: new Date(),
        required: true,

    },
    sample: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SampleSystem',
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
export const SampleSystemRemark = mongoose.model<ISampleSystemRemark, mongoose.Model<ISampleSystemRemark, {}, {}>>("SampleSystemRemark", SampleSystemRemarkSchema)