import mongoose from "mongoose";
import { IUser } from "./user.model";

export type ILeaveApproved = {
    _id: string,
    status: string,
    leave_type: string,//sl,fl,sw,cl
    leave: number,
    approved: boolean,
    yearmonth: number,
    employee: IUser,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const LeaveApprovedSchema = new mongoose.Schema<ILeaveApproved, mongoose.Model<ILeaveApproved, {}, {}>, {}>({
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
    approved: { type: Boolean, default: false },
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

export const LeaveApproved = mongoose.model<ILeaveApproved, mongoose.Model<ILeaveApproved, {}, {}>>("LeaveApproved", LeaveApprovedSchema)
