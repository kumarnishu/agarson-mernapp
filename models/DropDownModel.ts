import mongoose from "mongoose";
import { IChecklistCategory, ILeadType, ILeadSource, IStage, IDyeLocation, IDye, IItemUnit, IMachineCategory, IMachine, IPaymentCategory } from "../interfaces/DropDownInterface";


const ChecklistCategorySchema = new mongoose.Schema<IChecklistCategory, mongoose.Model<IChecklistCategory, {}, {}>, {}>({
    category: {
        type: String,
        lowercase: true,
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



const LeadTypeSchema = new mongoose.Schema<ILeadType, mongoose.Model<ILeadType, {}, {}>, {}>({
    type: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
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



const LeadSourceSchema = new mongoose.Schema<ILeadSource, mongoose.Model<ILeadSource, {}, {}>, {}>({
    source: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
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




const StageSchema = new mongoose.Schema<IStage, mongoose.Model<IStage, {}, {}>, {}>({
    stage: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
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




const DyeLocationSchema = new mongoose.Schema<IDyeLocation, mongoose.Model<IDyeLocation, {}, {}>, {}>({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    active: { type: Boolean, default: true },
    display_name: {
        type: String,
        required: true,
        trim: true
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





const ItemUnitSchema = new mongoose.Schema<IItemUnit, mongoose.Model<IItemUnit, {}, {}>, {}>({
    unit: {
        type: String,
        index: true,
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



const MachineCategorySchema = new mongoose.Schema<IMachineCategory, mongoose.Model<IMachineCategory, {}, {}>, {}>({
    category: {
        type: String,
        required: true,
        lowercase:true,
        trim: true
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






const MachineSchema = new mongoose.Schema<IMachine, mongoose.Model<IMachine, {}, {}>, {}>({
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
    }
    ,
    category: String,
    serial_no: { type: Number, default: 0 },
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




const PaymentCategorySchema = new mongoose.Schema<IPaymentCategory, mongoose.Model<IPaymentCategory, {}, {}>, {}>({
    category: {
        type: String,
        lowercase: true,
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


export const PaymentCategory = mongoose.model<IPaymentCategory, mongoose.Model<IPaymentCategory, {}, {}>>("PaymentCategory", PaymentCategorySchema)
export const Machine = mongoose.model<IMachine, mongoose.Model<IMachine, {}, {}>>("Machine", MachineSchema)
export const MachineCategory = mongoose.model<IMachineCategory, mongoose.Model<IMachineCategory, {}, {}>>("MachineCategory", MachineCategorySchema)
export const ItemUnit = mongoose.model<IItemUnit, mongoose.Model<IItemUnit, {}, {}>>("ItemUnit", ItemUnitSchema)
export const Dye = mongoose.model<IDye, mongoose.Model<IDye, {}, {}>>("Dye", DyeSchema)
export const DyeLocation = mongoose.model<IDyeLocation, mongoose.Model<IDyeLocation, {}, {}>>("DyeLocation", DyeLocationSchema)
export const Stage = mongoose.model<IStage, mongoose.Model<IStage, {}, {}>>("Stage", StageSchema)
export const LeadSource = mongoose.model<ILeadSource, mongoose.Model<ILeadSource, {}, {}>>("LeadSource", LeadSourceSchema)
export const LeadType = mongoose.model<ILeadType, mongoose.Model<ILeadType, {}, {}>>("LeadType", LeadTypeSchema)

export const ChecklistCategory = mongoose.model<IChecklistCategory, mongoose.Model<IChecklistCategory, {}, {}>>("ChecklistCategory", ChecklistCategorySchema)