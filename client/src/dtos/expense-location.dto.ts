import { DropDownDto } from "./dropdown.dto"

export type GetExpenseLocationDto = {
    _id: string,
    name: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
