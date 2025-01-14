import { DropDownDto } from "./DropDownDto"

//Response dto
type LeavesDto = {
    sl: string,
    fl: string,
    sw: string,
    cl: string
}
export type GetLeaveDto = {
    _id: string,
    leave_type: string,
    leave: number,
    status: string,
    yearmonth: number,
    photo: string,
    employee: DropDownDto,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type GetSalesmanAttendanceReportDto = {
    attendance: string,
    yearmonth: number,
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
    yearmonth: number,
    employee: DropDownDto,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type GetSalesmanKpiDto = {
    employee?: DropDownDto,
    date: string,
    month: string,
    attendance?: string,
    new_visit?: number,
    old_visit?: number,
    working_time?: string,
    new_clients: number,
    station?: DropDownDto,
    state?: string,
    currentsale_currentyear: number,
    currentsale_last_year: number,
    lastsale_currentyear: number,
    lastsale_lastyear: number,
    current_collection: number,
    ageing_above_90days: number,
    sale_growth: number,
    last_month_sale_growth: number,
}
export type GetSalesAttendanceDto = {
    _id: string,
    employee: DropDownDto,
    date: string,
    attendance: string,
    new_visit: number,
    old_visit: number,
    remark: string,
    sunday_working: string,
    in_time: string,
    end_time: string,
    station: DropDownDto,
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