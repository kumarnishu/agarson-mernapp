import mongoose from "mongoose";
import { IBill, IBillItem, IChecklist, IChecklistBox, ILead, IMaintenance, IMaintenanceItem, IProduction, IReferredParty, IRemark, IShoeWeight, ISoleThickness, ISpareDye, IUser, IUserMethods } from "../interfaces/feature.interface";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"


const UserSchema = new mongoose.Schema<IUser, mongoose.Model<IUser, {}, IUserMethods>, IUserMethods>({
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        select: false,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    mobile: {
        type: String,
        trim: true,
        required: true,
    },
    multi_login_token: String,
    is_multi_login: {
        type: Boolean,
        default: true,
    },
    dp: {
        _id: { type: String },
        filename: { type: String },
        public_url: { type: String },
        content_type: { type: String },
        size: { type: String },
        bucket: { type: String },
        created_at: Date
    },
    is_admin: {
        type: Boolean,
        default: false,
        required: true,
    },
    email_verified: {
        type: Boolean,
        default: false,
        required: true
    },

    mobile_verified: {
        type: Boolean,
        default: false,
        required: true
    },
    is_active: {
        type: Boolean,
        default: true,
        required: true
    },
    assigned_permissions: Array<string>,
    assigned_users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: []
        }
    ],
    assigned_erpEmployees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ErpEmployee',
            default: []
        }
    ],
    assigned_states: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'State',
            default: []
        }
    ],
    show_only_visiting_card_leads: {
        type: Boolean,
        default: false
    },
    assigned_crm_states: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CRMState',
            default: []
        }
    ],
    assigned_crm_cities: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CRMCity',
            default: []
        }
    ],

    last_login: {
        type: Date,
        default: new Date(),
        required: true,
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
    },
    orginal_password: String,
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpire: {
        type: Date,
        default: null
    },
    emailVerifyToken: {
        type: String,
        default: null
    },
    emailVerifyExpire: {
        type: Date,
        default: null
    },
})
UserSchema.pre('save', async function (next) {
    if (!this.isModified("password")) next();
    this.password = await bcrypt.hash(this.password, 10)
});
UserSchema.method("getAccessToken", function () {
    return jwt.sign({ id: this._id }, process.env.JWT_ACCESS_USER_SECRET || "kkskhsdhk", {
        expiresIn: process.env.JWT_ACCESS_EXPIRE,
    });
}
)
UserSchema.method("comparePassword", function (password: string) {
    return bcrypt.compare(password, this.password);
})
UserSchema.method("getResetPasswordToken", function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = resetToken
    this.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    return resetToken;
})
UserSchema.method("getEmailVerifyToken", function () {
    const emailToken = crypto.randomBytes(32).toString('hex');
    this.emailVerifyToken = emailToken
    this.emailVerifyExpire = new Date(Date.now() + 15 * 60 * 1000);
    return emailToken;
})



const leadSchema = new mongoose.Schema<ILead, mongoose.Model<ILead>>({
    name: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
    },
    customer_name: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
    },
    customer_designation: {
        type: String,
        trim: true,
        lowercase: true,
    },
    mobile: {
        type: String,
        trim: true,
        index: true,
        required: true,
    },
    uploaded_bills: {
        type: Number,
        default: 0
    },
    last_remark: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        index: true,
        lowercase: true
    },
    city: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
    },
    state: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
    },
    country: {
        type: String,
        trim: true,
        lowercase: true,
    },
    address: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
    },
    work_description: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
    },
    turnover: {
        type: String,
        trim: true,
        index: true,
    },
    alternate_mobile1: {
        type: String,
        trim: true,
    },
    alternate_mobile2: {
        type: String,
        trim: true,
    },
    alternate_email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    lead_type: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
    },
    gst: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
    },
    stage: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
        default: "open"
    },
    lead_source: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
        default: "internet"
    },
    has_card: { type: Boolean, default: false },

    visiting_card: {
        _id: { type: String },
        filename: { type: String },
        public_url: { type: String },
        content_type: { type: String },
        size: { type: String },
        bucket: { type: String },
        created_at: Date
    },

    referred_party: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReferredParty'
    },
    referred_date: {
        type: Date
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
    },
})
leadSchema.index({ '$**': 'text' })
const Lead = mongoose.model<ILead, mongoose.Model<ILead>>("Lead", leadSchema);
const ReferredPartySchema = new mongoose.Schema<IReferredParty, mongoose.Model<IReferredParty, {}, {}>, {}>({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true,
        lowercase: true,
    },
    customer_name: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
    },
    uploaded_bills: {
        type: Number,
        default: 0
    },
    refers: {
        type: Number,
        default: 0
    },
    last_remark: {
        type: String,
        trim: true,
    },
    gst: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
        required: true
    },
    mobile: {
        type: String,
        required: true,
        trim: true,
        index: true,
        lowercase: true
    },
    mobile2: {
        type: String,
        trim: true,
        index: true,
        lowercase: true
    },
    mobile3: {
        type: String,
        trim: true,
        index: true,
        lowercase: true
    },
    city: {
        type: String,
        required: true,
        trim: true,
        index: true,
        lowercase: true,
    },
    address: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
    },
    state: {
        type: String,
        required: true,
        trim: true,
        index: true,
        lowercase: true,
    },
    convertedfromlead: { type: Boolean, default: false },
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
const RemarkSchema = new mongoose.Schema<IRemark, mongoose.Model<IRemark, {}, {}>, {}>({
    remark: {
        type: String,
        required: true,
        trim: true,
        index: true,
        lowercase: true,
    },
    remind_date: {
        type: Date,
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
    },
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead'
    },
    refer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReferredParty'
    }
})
const BillItemSchema = new mongoose.Schema<IBillItem, mongoose.Model<IBillItem, {}, {}>, {}>({
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true
    },
    bill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IBill',
        required: true
    },
    qty: Number,
    rate: Number,
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
const BillSchema = new mongoose.Schema<IBill, mongoose.Model<IBill, {}, {}>, {}>({
    bill_no: {
        type: String,
        required: true,
        trim: true,
        index: true,
        lowercase: true,
    },
    billphoto: {
        _id: { type: String },
        filename: { type: String },
        public_url: { type: String },
        content_type: { type: String },
        size: { type: String },
        bucket: { type: String },
        created_at: Date
    },
    remarks: {
        type: String,
        required: true,
        trim: true,
        index: true,
        lowercase: true,
    },
    bill_date: {
        type: Date,
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
    },
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead'
    },
    refer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReferredParty'
    }
})


const ChecklistSchema = new mongoose.Schema<IChecklist, mongoose.Model<IChecklist, {}, {}>, {}>({
    work_title: {
        type: String,
        lowercase: true,
        required: true
    },
    link: {
        type: String,
    },
    frequency: {
        type: String,
        lowercase: true,
        required: true
    },
    end_date: {
        type: Date,
        default: new Date(),
        required: true
    },
    next_date: {
        type: Date
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
    category:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChecklistCategory',
        required: true
    },
    user:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
    ,
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
const ChecklistBoxSchema = new mongoose.Schema<IChecklistBox, mongoose.Model<IChecklistBox, {}, {}>, {}>({
    date: { type: Date, required: true },
    checked: { type: Boolean, default: false },
    remarks: String,
    checklist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Checklist',
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
    frequency: String,
    item: String,
    items: [
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

export const User = mongoose.model<IUser, mongoose.Model<IUser, {}, IUserMethods>>("User", UserSchema)
export const BillItem = mongoose.model<IBillItem, mongoose.Model<IBillItem, {}, {}>>("BillItem", BillItemSchema)
export const Bill = mongoose.model<IBill, mongoose.Model<IBill, {}, {}>>("Bill", BillSchema)
export const Checklist = mongoose.model<IChecklist, mongoose.Model<IChecklist, {}, {}>>("Checklist", ChecklistSchema)
export const ChecklistBox = mongoose.model<IChecklistBox, mongoose.Model<IChecklistBox, {}, {}>>("ChecklistBox", ChecklistBoxSchema)
export default Lead;
export const MaintenanceItem = mongoose.model<IMaintenanceItem, mongoose.Model<IMaintenanceItem, {}, {}>>("MaintenanceItem", MaintenanceItemSchema)
export const Maintenance = mongoose.model<IMaintenance, mongoose.Model<IMaintenance, {}, {}>>("Maintenance", MaintenanceSchema)
export const Production = mongoose.model<IProduction, mongoose.Model<IProduction, {}, {}>>("Production", ProductionSchema)
export const ReferredParty = mongoose.model<IReferredParty, mongoose.Model<IReferredParty, {}, {}>>("ReferredParty", ReferredPartySchema)
export const Remark = mongoose.model<IRemark, mongoose.Model<IRemark, {}, {}>>("Remark", RemarkSchema)
export const ShoeWeight = mongoose.model<IShoeWeight, mongoose.Model<IShoeWeight, {}, {}>>("ShoeWeight", ShoeWeightSchema)
export const SoleThickness = mongoose.model<ISoleThickness, mongoose.Model<ISoleThickness, {}, {}>>("SoleThickness", SoleThicknessSchema)
export const SpareDye = mongoose.model<ISpareDye, mongoose.Model<ISpareDye, {}, {}>>("SpareDye", SpareDyeSchema)
