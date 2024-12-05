import { DropDownDto } from "./dropdown.dto"

export type GetDyeLocationDto = {
    _id: string,
    name: string,
    active: boolean,
    display_name: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type CreateOrEditDyeLocationDto = {
    name: string, display_name: string
}