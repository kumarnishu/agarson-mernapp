import { DropDownDto } from "./dropdown.dto"

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
export type CreateOrEditRemarkDto = {
    remark: string,
    remind_date: string,
    stage: string,
    has_card: boolean
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