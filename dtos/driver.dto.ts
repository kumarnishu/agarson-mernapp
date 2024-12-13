import { DropDownDto } from "./dropdown.dto"

export type GetDriverSystemDto = {
    _id: string,
    date: string,
    driver: DropDownDto
    party: string,
    billno: string,
    marka: string,
    transport: string,
    location: string,
    photo: string,
    remarks: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}

export type CreateOrEditDriverSystemDto = {
    date: string,
    driver: string
    party: string,
    billno: string,
    marka: string,
    transport: string,
    remarks: string,
}