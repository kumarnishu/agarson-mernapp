import { DropDownDto } from "./dropdown.dto"

export type GetLeadTypeDto = {
    _id: string,
    type: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}