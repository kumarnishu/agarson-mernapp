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
    leave: string,
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
    sl: string,
    fl: string,
    sw: string,
    cl: string,
    yearmonth: string,
    employee: DropDownDto,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}