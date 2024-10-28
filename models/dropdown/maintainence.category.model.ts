import mongoose from "mongoose"
import { IUser } from "../features/user.model"

export type IMaintenanceCategory = {
    _id: string,
    category: string,
    active: boolean,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
const MaintenanceCategorySchema = new mongoose.Schema<IMaintenanceCategory, mongoose.Model<IMaintenanceCategory, {}, {}>, {}>({
    category: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    active: {
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

export const MaintenanceCategory = mongoose.model<IMaintenanceCategory, mongoose.Model<IMaintenanceCategory, {}, {}>>("MaintenanceCategory", MaintenanceCategorySchema)