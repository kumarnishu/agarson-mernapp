import mongoose from "mongoose";
import { ILeave, ISalesAttendance } from "../interfaces/AttendanceInterface";

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



const flexibleSchema = new mongoose.Schema({}, { strict: false });
const columnSchema = new mongoose.Schema({
    name: { type: String, required: true },
    created_at: {
        type: Date, default: new Date()
    }
})

export const SalesmanLeaves = mongoose.model("SalesmanLeaves", flexibleSchema)
export const SalesmanLeavesColumns = mongoose.model("SalesmanLeavesColumns", columnSchema)
export const Leave = mongoose.model<ILeave, mongoose.Model<ILeave, {}, {}>>("Leave", LeaveSchema)
export const SalesAttendance = mongoose.model<ISalesAttendance, mongoose.Model<ISalesAttendance, {}, {}>>("SalesAttendance", SalesAttendanceSchema)

