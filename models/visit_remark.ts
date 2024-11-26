import mongoose from "mongoose";
import { IUser } from "./user";

export type IVisitRemark = {
    _id: string,
    remark: string,
    employee: IUser,
    visit_date: Date,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

const VisitRemarkSchema = new mongoose.Schema<IVisitRemark, mongoose.Model<IVisitRemark, {}, {}>, {}>({
    remark: {
        type: String,
        lowercase: true,
        required: true
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    visit_date: Date,
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


export const VisitRemark = mongoose.model<IVisitRemark, mongoose.Model<IVisitRemark, {}, {}>>("VisitRemark", VisitRemarkSchema)
