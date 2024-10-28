import mongoose from "mongoose"
import { IUser } from "./user.model"
import { IMachine } from "../dropdown/machine.model"

export type IMaintenanceItem = {
    _id: string,
    machine: IMachine,
    other:string,
    is_required:boolean,
    stage:string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
const MaintenanceItemSchema = new mongoose.Schema<IMaintenanceItem, mongoose.Model<IMaintenanceItem, {}, {}>, {}>({
    machine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine'
    },
    other: String,
    stage: String,
    is_required: {
        type: Boolean,
        default: true
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

export const MaintenanceItem = mongoose.model<IMaintenanceItem, mongoose.Model<IMaintenanceItem, {}, {}>>("MaintenanceItem", MaintenanceItemSchema)