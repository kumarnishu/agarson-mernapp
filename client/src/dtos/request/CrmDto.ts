
//Request dto
export type CreateLeadFromExcelDto = {
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
export type CreateReferFromExcelDto = {
    _id: string,
    name: string,
    customer_name: string,
    mobile: string,
    mobile2: string,
    mobile3: string,
    address: string,
    gst: string,
    city: string,
    state: string,
    status?: string
}
export type CreateOrEditBillDto = {
    items: CreateOrEditBillItemDto[],
    lead: string,
    billphoto: string,
    remarks: string,
    refer: string,
    bill_no: string,
    bill_date: string,
}
export type CreateOrEditBillItemDto = {
    _id?: string,
    article: string,
    qty: number,
    rate: number,
}
export type CreateOrEditRemarkDto = {
    remark: string,
    remind_date: string,
    stage: string,
    has_card: boolean
}
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
export type CreateOrEditMergeRefersDto = {
    name: string,
    mobiles: string[],
    city: string,
    state: string,
    address: string,
    merge_assigned_refers: boolean,
    merge_remarks: boolean,
    source_refer_id: string,
    merge_bills: boolean
}
export type CreateOrEditReferDto = {
    _id: string,
    name: string,
    customer_name: string,
    mobile: string,
    mobile2: string,
    mobile3: string,
    address: string,
    gst: string,
    city: string,
    state: string
}