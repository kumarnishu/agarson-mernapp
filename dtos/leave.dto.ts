import { DropDownDto } from "./dropdown.dto"

export type GetLeaveDto = {
    _id: string,
    sl: number,
    fl: number,
    sw: number,
    cl: number,
    yearmonth: number,
    employee: DropDownDto,
    created_at: Date,
    updated_at: Date,
    created_by: DropDownDto,
    updated_by: DropDownDto
}

export type CreateOrEditLeaveDto={
    sl: number,
    fl: number,
    sw: number,
    cl: number,
    yearmonth: number,
    employee: string,
}