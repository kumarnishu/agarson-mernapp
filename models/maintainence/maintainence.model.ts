import mongoose from "mongoose"
import { IUser } from "../users/user.model"
import { IMaintenanceCategory } from "./maintainence.category.model"
import { IMaintenanceItem } from "./maintainence.item.model"

export type IMaintenance = {
    _id: string,
    work: string,
    active:boolean,
    category: IMaintenanceCategory,
    frequency:string,
    user:IUser,
    item:string,
    items: IMaintenanceItem[]
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
const MaintenanceSchema = new mongoose.Schema<IMaintenance, mongoose.Model<IMaintenance, {}, {}>, {}>({
    active: {
        type: Boolean,
        default: true
    },
    work: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MaintenanceCategory',
        required: true
    },
    frequency:String,
    item:String,
    items:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MaintenanceItem',
        }
    ],
    user: {
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

export const Maintenance = mongoose.model<IMaintenance, mongoose.Model<IMaintenance, {}, {}>>("Maintenance", MaintenanceSchema)