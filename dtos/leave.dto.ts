import { DropDownDto } from "./dropdown.dto"

export type GetLeaveDto = {
    _id: string,
    leave_type: string,
    leave: number,
    status: string,
    yearmonth: number,
    employee: DropDownDto,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type LeavesDto = {
    sl: number,
    fl: number,
    sw: number,
    cl: number
}
export type GetSalesmanAttendanceReportDto = {
    _id: string,
    yearmonth: number,
    provided: LeavesDto,
    brought_forward: LeavesDto,
    total: LeavesDto,
    consumed: LeavesDto,
    employee: DropDownDto,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type GetLeaveBalanceDto = {
    _id: string,
    sl: number,
    fl: number,
    sw: number,
    cl: number,
    yearmonth: number,
    employee: DropDownDto,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}

export type CreateOrEditLeaveBalanceDto = {
    sl: number,
    fl: number,
    sw: number,
    cl: number,
    yearmonth: number,
    employee: string,
}