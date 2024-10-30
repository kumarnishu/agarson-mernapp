import mongoose from "mongoose"
import { IArticle } from "./article"
import { IUser } from "./user"

export type IDye = {
    _id: string,
    active: boolean,
    dye_number: number,
    size: string,
    articles:IArticle[],
    stdshoe_weight:number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const DyeSchema = new mongoose.Schema<IDye, mongoose.Model<IDye, {}, {}>, {}>({
    dye_number: {
        type: Number,
        required: true,
        trim: true
    },
    stdshoe_weight: {
        type: Number,
        required: true,
        trim: true,
        default:0
    },
    size: {
        type: String,
        required: true,
        trim: true
    },
    articles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
    }],
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

export const Dye = mongoose.model<IDye, mongoose.Model<IDye, {}, {}>>("Dye", DyeSchema)