import mongoose from "mongoose"
import { IArticle, IProduction, IShoeWeight, ISoleThickness, ISpareDye } from "../interfaces/ProductionInterface"


const ArticleSchema = new mongoose.Schema<IArticle, mongoose.Model<IArticle, {}, {}>, {}>({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    display_name: {
        type: String,
        required: true,
        trim: true
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



const ProductionSchema = new mongoose.Schema<IProduction, mongoose.Model<IProduction, {}, {}>, {}>({
    machine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        required: true
    },
    thekedar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    articles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article',
            required: true
        }
    ],
    date: { type: Date, required: true },
    production_hours: Number,
    manpower: Number,
    production: Number,
    big_repair: Number,
    upper_damage: Number,
    small_repair: Number,
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


const ShoeWeightSchema = new mongoose.Schema<IShoeWeight, mongoose.Model<IShoeWeight, {}, {}>, {}>({
    machine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        required: true
    },
    dye: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dye',
        required: true
    },
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true
    },
    month: Number,
    shoe_weight1: Number,
    upper_weight1: { type: Number, default: 0 },
    upper_weight2: { type: Number, default: 0 },
    upper_weight3: { type: Number, default: 0 },
    shoe_photo1: {
        _id: { type: String },
        filename: { type: String },
        public_url: { type: String },
        content_type: { type: String },
        size: { type: String },
        bucket: { type: String },
        created_at: Date,
    },
    shoe_weight2: Number,
    shoe_photo2: {
        _id: { type: String },
        filename: { type: String },
        public_url: { type: String },
        content_type: { type: String },
        size: { type: String },
        bucket: { type: String },
        created_at: Date,
    },
    shoe_weight3: Number,
    shoe_photo3: {
        _id: { type: String },
        filename: { type: String },
        public_url: { type: String },
        content_type: { type: String },
        size: { type: String },
        bucket: { type: String },
        created_at: Date,
    },
    is_validated: { type: Boolean, default: false },
    weighttime1: Date,
    weighttime2: Date,
    weighttime3: Date,
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




const SoleThicknessSchema = new mongoose.Schema<ISoleThickness, mongoose.Model<ISoleThickness, {}, {}>, {}>({
    dye: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dye',
        required: true
    },
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true
    },
    size: {
        type: String,
        required: true,
        trim: true
    },
    left_thickness: { type: Number, default: 0 },
    right_thickness: { type: Number, default: 0 },
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


const SpareDyeSchema = new mongoose.Schema<ISpareDye, mongoose.Model<ISpareDye, {}, {}>, {}>({

    dye: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dye',
        required: true
    },
    repair_required: { type: Boolean, default: false },
    remarks: { type: String, default: "" },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DyeLocation'
    },
    is_validated: { type: Boolean, default: false },
    dye_photo: {
        _id: { type: String },
        filename: { type: String },
        public_url: { type: String },
        content_type: { type: String },
        size: { type: String },
        bucket: { type: String },
        created_at: Date,
    },
    photo_time: Date,
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

export const SpareDye = mongoose.model<ISpareDye, mongoose.Model<ISpareDye, {}, {}>>("SpareDye", SpareDyeSchema)

export const SoleThickness = mongoose.model<ISoleThickness, mongoose.Model<ISoleThickness, {}, {}>>("SoleThickness", SoleThicknessSchema)
export const ShoeWeight = mongoose.model<IShoeWeight, mongoose.Model<IShoeWeight, {}, {}>>("ShoeWeight", ShoeWeightSchema)
export const Production = mongoose.model<IProduction, mongoose.Model<IProduction, {}, {}>>("Production", ProductionSchema)
export const Article = mongoose.model<IArticle, mongoose.Model<IArticle, {}, {}>>("Article", ArticleSchema)

