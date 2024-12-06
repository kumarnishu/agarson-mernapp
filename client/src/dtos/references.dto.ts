import { DropDownDto } from "./dropdown.dto"

export type GetReferenceDto = {
    _id: string,
    gst: string,
    party: string,
    address: string,
    state: string,
    pincode: number,
    business: string,
    sale_scope: number,
    reference: string
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}

export type GetReferenceExcelDto = {
    _id: string,
    gst: string,
    party: string,
    address: string,
    state: string,
    pincode: number,
    business: string,
    sale_scope: number,
    reference: String,
    status?:string
}