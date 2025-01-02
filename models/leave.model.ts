import mongoose from "mongoose";
import { Asset, IUser } from "./user.model";

export type ILeave = {
    _id: string,
    status: string,
    leave_type: string,//sl,fl,sw,cl
    leave: number,
    yearmonth: number,
    employee: IUser,
    created_at: Date,
    photo:Asset
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const LeaveSchema = new mongoose.Schema<ILeave, mongoose.Model<ILeave, {}, {}>, {}>({
    status: { type: String, required: true, default: 'pending' },
    leave_type: {
        type: String,
        required: true
    },
    leave: {
        type: Number,
        default: 0,
        required: true
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
    yearmonth: {
        type: Number,
        required: true
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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

export const Leave = mongoose.model<ILeave, mongoose.Model<ILeave, {}, {}>>("Leave", LeaveSchema)
