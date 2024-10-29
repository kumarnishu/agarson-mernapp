import mongoose from "mongoose"
import { IUser } from "../users/user.model"
import { IMaintenanceItem } from "./maintainence.item.model"


export type IMaintenanceRemark = {
    _id: string,
    remark: string,
    item: IMaintenanceItem,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

const MaintenanceRemarkSchema = new mongoose.Schema<IMaintenanceRemark, mongoose.Model<IMaintenanceRemark, {}, {}>, {}>({
    remark: {
        type: String,
        required: true,
        trim: true,
        index: true,
        lowercase: true,
    },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MaintenanceItem'
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

export const MaintenanceRemark = mongoose.model<IMaintenanceRemark, mongoose.Model<IMaintenanceRemark, {}, {}>>("MaintenanceRemark", MaintenanceRemarkSchema)