import { DropDownDto } from "./dropdown.dto"

export type GetMachineDto = {
    _id: string,
    name: string,
    active: boolean,
    category: string,
    serial_no: number,
    display_name: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type CreateOrEditMachineDto = {
    name: string,
    display_name: string,
    serial_no: number,
    category: string
}