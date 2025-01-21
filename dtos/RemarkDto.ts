import { DropDownDto } from "./DropDownDto"

export type GetSampleSystemRemarkDto = {
    _id: string,
    remark: string,
    next_call: string,
    sample:DropDownDto,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}

export type CreateOrEditSampleRemarkDto = {
    remark: string,
    next_call?: string,
    stage:string,
    sample:string
}
