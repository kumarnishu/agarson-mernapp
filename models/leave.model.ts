import mongoose from "mongoose";
import { IUser } from "./user.model";

export type ILeave = {
    _id: string,
    sl: number,
    fl: number,
    sw: number,
    cl: number,
    
    yearmonth: number,
    employee: IUser,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const LeaveSchema = new mongoose.Schema<ILeave, mongoose.Model<ILeave, {}, {}>, {}>({

    sl: {
        type: Number,
        default: 0,
        required: true
    },
    fl: {
        type: Number,
        default: 0,
        required: true
    },
    sw: {
        type: Number,
        default: 0,
        required: true
    },
    cl: {
        type: Number,
        default: 0,
        required: true
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
