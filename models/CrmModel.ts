import mongoose from "mongoose"
import { IBillItem, IRemark, ILead, IReferredParty, IBill } from "../interfaces/CrmInterface"




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
    uploaded_bills:{
        type:Number,
        default:0
    },
    last_remark:{
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
        default:"internet"
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

export const ReferredParty = mongoose.model<IReferredParty, mongoose.Model<IReferredParty, {}, {}>>("ReferredParty", ReferredPartySchema)
export default Lead;
export const Remark = mongoose.model<IRemark, mongoose.Model<IRemark, {}, {}>>("Remark", RemarkSchema)
export const Bill = mongoose.model<IBill, mongoose.Model<IBill, {}, {}>>("Bill", BillSchema)
export const BillItem = mongoose.model<IBillItem, mongoose.Model<IBillItem, {}, {}>>("BillItem", BillItemSchema)

