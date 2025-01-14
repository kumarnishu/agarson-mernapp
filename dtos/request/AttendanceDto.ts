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