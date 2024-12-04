import { DropDownDto } from "./dropdown.dto"

export type MergeTwoLeadsDto = {
    name: string,
    mobiles: string[],
    city: string,
    state: string,
    stage: string,
    email: string,
    alternate_email: string,
    address: string,
    merge_refer: boolean,
    merge_remarks: boolean,
    source_lead_id: string,
    refer_id: string
}


export type GetLeadFromExcelDto = {
    _id: string,
    name: string,
    customer_name: string,
    customer_designation: string,
    gst: string,
    mobile: string,
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
    lead_source: string
    status?: string
}
export type GetLeadDto = {
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
    lead_source: string
    visiting_card: string,
    referred_party_name?: string,
    referred_party_mobile?: string,
    referred_date?: string,
    last_remark: string,
    uploaded_bills: number,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type CreateOrEditLeadDto = {
    name: string,
    customer_name: string,
    customer_designation: string,
    mobile: string,
    email: string
    gst: string
    city: string,
    state: string,
    country: string,
    address: string,
    remark: string,
    work_description: string,
    turnover: string,
    lead_type: string,
    alternate_mobile1: string,
    alternate_mobile2: string,
    alternate_email: string,
    lead_source: string,
}
export type CreateOrRemoveReferForLeadDto = {
    party_id: string,
    remark: string,
    remind_date: string
}

export type CreateOrEditMergeLeadsDto = {
    name: string,
    mobiles: string[],
    city: string,
    state: string,
    stage: string,
    email: string,
    alternate_email: string,
    address: string,
    merge_refer: boolean,
    merge_remarks: boolean,
    source_lead_id: string,
    merge_bills: boolean
}