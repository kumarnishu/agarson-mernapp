import { DropDownDto } from "./DropDownDto"

//Response dto
type LeavesDto = {
    sl: number,
    fl: number,
    sw: number,
    cl: number
}
export type GetLeaveDto = {
    _id: string,
    leave_type: string,
    leave: number,
    status: string,
    yearmonth: string,
    photo: string,
    employee: DropDownDto,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type GetSalesmanAttendanceReportDto = {
    attendance: string,
    yearmonth: string,
    provided: LeavesDto,
    brought_forward: LeavesDto,
    carryforward: LeavesDto,
    total: LeavesDto,
    consumed: LeavesDto,
    employee: DropDownDto
}
export type GetLeaveBalanceDto = {
    _id: string,
    sl: number,
    fl: number,
    sw: number,
    cl: number,
    yearmonth: string,
    employee: DropDownDto,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
//Request dto
export type ApplyLeaveDtoFromAdmin = {
    leave_type: string,
    leave: number,
    status: string,
    yearmonth: number,
    employee: string,
}
export type ApplyLeaveDto = {
    leave_type: string,
    leave: number,
    yearmonth: number,
    employee: string,
}
export type CreateOrEditLeaveBalanceDto = {
    sl: number,
    fl: number,
    sw: number,
    cl: number,
    yearmonth: number,
    employee: string,
}
export type CreateOrEditSalesAttendanceDto = {
    employee: string,
    date: string,
    attendance: string,
    is_sunday_working: boolean,
    new_visit: number,
    old_visit: number,
    remark: string,
    in_time: string,
    end_time: string,
    station: string
}