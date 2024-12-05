import { DropDownDto } from "./dropdown.dto"

export type GetVisitReportDto = {
    _id: string,
    employee: string
    visit_date: string,
    customer: string,
    intime: string,
    outtime: string,
    visitInLocation: string,
    visitOutLocation: string,
    remarks: string,
    created_at: string,
    updated_at: string,
    created_by: string,
    updated_by: string,
}

export type GetSalesManVisitSummaryReportDto = {
    employee: DropDownDto,
    date1: string,
    old_visits1: number,
    new_visits1: number,
    working_time1: string,
    date2: string,
    old_visits2: number,
    new_visits2: number,
    working_time2: string,
    date3: string,
    old_visits3: number,
    new_visits3: number,
    working_time3: string,
    last_remark: string
}




export type GetSalesAttendancesAuto = {
    employee: DropDownDto,
    date: string,
    new_visit: number,
    old_visit: number,
    worktime: string,
}
