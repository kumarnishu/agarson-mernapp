import { DropDownDto } from "../common/dropdown.dto";

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

export type GetCrmCityDto = {
    _id: string,
    city: string;
    state: string;
    assigned_users: string;
}
export type GetCrmStateDto = {
    _id: string,
    state: string,
    assigned_users: string;
}

export type AssignOrRemoveCrmCityDto = {
    user_ids: string[],
    city_ids: string[],
    flag: number
}
export type AssignOrRemoveCrmStateDto = {
    user_ids: string[],
    state_ids: string[],
    flag: number
}

export type CreateAndUpdatesStateFromExcelDto = {
    _id: string,
    state: string,
    users?: string,
    status?: string
}
export type CreateAndUpdatesCityFromExcelDto = {
    _id: string,
    city: string,
    users?: string,
    status?: string
}
export type CreateOrEditCrmCity = {
    id: string,
    state: string,
    city: string
}

export type CreateAndUpdatesLeadFromExcelDto = {
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
    party_id: string, remark: string, remind_date: string
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
export type GetReferDto = {
    _id: string,
    name: string,
    customer_name: string,
    mobile: string,
    mobile2: string,
    mobile3: string,
    address: string,
    gst: string,
    last_remark: string,
    uploaded_bills: number,
    refers: number,
    city: string,
    state: string,
    convertedfromlead: boolean,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
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
export type CreateOrEditReferFromExcelDto = {
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
export type GetRemarksDto = {
    _id: string,
    remark: string,
    lead_id?: string,
    lead_name?: string,
    lead_mobile?: string,
    refer_id?: string,
    refer_name?: string,
    refer_mobile?: string,
    remind_date: string,
    created_date: string,
    created_by: DropDownDto

}


export type GetActivitiesTopBarDetailsDto = { stage: string, value: number }
export type GetActivitiesOrRemindersDto = {
    _id: string,
    remark: string,
    remind_date?: string,
    created_at: string,
    created_by: DropDownDto,
    lead_id: string,
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
    referred_date?: string

}

export type GetBillItemDto = {
    _id: string,
    article: DropDownDto,
    qty: number,
    rate: number,
    bill: DropDownDto,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto

}
export type CreateOrEditBillItemDto = {
    _id?: string,
    article: string,
    qty: number,
    rate: number,
}

export type GetBillDto = {
    _id: string,
    items: CreateOrEditBillItemDto[],
    lead?: DropDownDto,
    billphoto: string,
    refer?: DropDownDto,
    bill_no: string,
    bill_date: string,
    remarks: string,
    created_at: Date,
    updated_at: Date,
    created_by: DropDownDto,
    updated_by: DropDownDto

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

export type CreateOrEditRemarkDto = {
    remark: string,
    maintenance_id: string,
    remind_date: string,
    stage: string,
    has_card: boolean
}

