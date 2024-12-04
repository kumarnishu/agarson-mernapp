import { DropDownDto } from "./dropdown.dto"



export type GetMachineCategoryDto = {
    _id: string,
    category: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
