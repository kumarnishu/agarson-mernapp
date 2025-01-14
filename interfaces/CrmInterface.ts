import { IArticle } from "./ProductionInterface"
import { IUser, Asset } from "./UserInterface"



export type IBillItem = {
    _id: string,
    article: IArticle,
    qty: number,
    rate: number,
    bill: IBill,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


export type IBill = {
    _id: string,
    lead: ILead,
    billphoto: Asset,
    refer: IReferredParty,
    bill_no: string,
    remarks:string,
    bill_date: Date,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

    
export type IRemark = {
    _id: string,
    remark: string,
    lead: ILead,
    refer:IReferredParty,
    created_at: Date,
    remind_date: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


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


export type IReferredParty = {
    _id: string,
    name: string,
    customer_name: string,
    mobile: string,
    mobile2: string,
    mobile3: string,
    address: string,
    last_remark: string,
    uploaded_bills: number,
    refers:number,
    gst: string,
    city: string,
    state: string,
    convertedfromlead: boolean,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

