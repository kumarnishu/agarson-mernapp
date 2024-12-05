import { DropDownDto } from "./dropdown.dto"


export type GetExpenseCategoryDto = {
    _id: string,
    category: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}

