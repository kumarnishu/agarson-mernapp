import mongoose from "mongoose";
import { IReferredParty } from "./referred.model";
import { Asset, IUser } from "./user.model";

export type ILead = {
    _id: string,
    name: string,
    customer_name: string,
    customer_designation: string,
    mobile: string,
    gst: string,
    has_card: boolean,
    email: string,
    city: string,
    state: string,
    country: string,
    address: string,
    work_description: string,
    turnover: string,
    alternate_mobile1: string,
    alternate_mobile2: string,
    alternate_email: string,
    lead_type: string
    stage: string
    lead_source: string,
    last_remark:string,
    uploaded_bills:number,
    visiting_card: Asset,
    referred_party?: IReferredParty,
    referred_date?: Date,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
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
export default Lead;