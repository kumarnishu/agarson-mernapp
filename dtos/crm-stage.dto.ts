import { DropDownDto } from "./dropdown.dto"

export type GetStageDto = {
    _id: string,
    stage: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}