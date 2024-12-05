import { DropDownDto } from "./dropdown.dto"

export type GetLeadSourceDto = {
    _id: string,
    source: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}