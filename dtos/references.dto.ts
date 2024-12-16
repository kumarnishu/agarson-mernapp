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
}

export type GetReferenceExcelDto = {
    _id: string,
    date:string,
    gst: string,
    party: string,
    address: string,
    state: string,
    pincode: number,
    business: string,
    sale_scope: number,
    reference: string,
    status?:string
}