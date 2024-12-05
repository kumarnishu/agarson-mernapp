import { DropDownDto } from "./dropdown.dto"

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
export type GetReferFromExcelDto = {
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