import mongoose from "mongoose";
import { IUser } from "./user.model";
import { ICRMCity } from "./crm-city.model";


export type ISalesAttendance = {
    _id: string,
    employee: IUser,
    date: Date,
    attendance: string,
    is_sunday_working:boolean,
    new_visit: number,
    old_visit: number,
    remark: string,
    in_time: string,
    end_time: string,
    station: ICRMCity,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const SalesAttendanceSchema = new mongoose.Schema<ISalesAttendance, mongoose.Model<ISalesAttendance, {}, {}>, {}>({
    employee:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
    ,
    date: {
        type: Date,
        required: true
    },
    attendance: {
        type: String,
        lowercase: true,
        required: true
    },
    is_sunday_working: { type: Boolean, default: false },
    new_visit: {
        type: Number,
        default: 0
    },
    old_visit: {
        type: Number,
        default: 0
    },
    in_time: String,
    end_time: String,
    remark: String,
    station: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CRMCity',
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

export const SalesAttendance = mongoose.model<ISalesAttendance, mongoose.Model<ISalesAttendance, {}, {}>>("SalesAttendance", SalesAttendanceSchema)
