import { DropDownDto } from "./dropdown.dto"


export type GetItemUnitDto = {
    _id: string,
    unit: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
