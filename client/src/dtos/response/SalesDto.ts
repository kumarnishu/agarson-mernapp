import { DropDownDto } from "./DropDownDto";


//Response dto
export type GetReferenceRemarksDto = {
    _id: string,
    remark: string,
    party:string,
    next_date: string,
    created_date: string,
    created_by: string,

}
export type GetReferenceDto = {
    party: string;
    gst: string;
    address: string;
    state: string;
    stage:string,
    next_call:string,
    last_remark:string,
    pincode: string;
    business: string;
    [key: string]: string ; // Index signature for dynamic reference columns
};
export type GetReferenceReportForSalesmanDto = {
    _id: string,
    party: string,
    address: string,
    gst: string,
    state: string,
    stage:string,
    status: string,
    last_remark: string
}
export type GetSalesDto = {
    _id: string,
    date: string,
    invoice_no: string,
    party: string,
    month: string,
    state: string,
    amount: string
}
export type GetCollectionsDto = {
    _id: string,
    date: string,
    month: string,
    party: string,
    state: string,
    amount: string
}
export type GetAgeingDto = {
    _id: string,
    state: string,
    party: string,
    next_call?: string,
    last_remark?: string,
    two5: string,
    three0: string,
    five5: string,
    six0: string,
    seven0: string,
    seventyplus: string,
}
export type GetAgeingRemarkDto = {
    _id: string,
    remark: string,
    party: string,
    nextcall: string,
    created_at: string,
    created_by: string
}
export type GetVisitSummaryReportRemarkDto = {
    _id: string,
    remark: string,
    employee: DropDownDto,
    visit_date: string,
    created_at: string,
    created_by: string
}
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
    old_visits1: string,
    new_visits1: string,
    working_time1: string,
    date2: string,
    old_visits2: string,
    new_visits2: string,
    working_time2: string,
    date3: string,
    old_visits3: string,
    new_visits3: string,
    working_time3: string,
    last_remark: string
}
export type GetSalesAttendancesAuto = {
    employee: DropDownDto,
    date: string,
    new_visit: string,
    old_visit: string,
    worktime: string,
}

export type GetSalesmanKpiDto = {
    employee?: DropDownDto,
    date: string,
    month: string,
    attendance?: string,
    new_visit?: string,
    old_visit?: string,
    working_time?: string,
    new_clients: string,
    station?: DropDownDto,
    state?: string,
    currentsale_currentyear: string,
    currentsale_last_year: string,
    lastsale_currentyear: string,
    lastsale_lastyear: string,
    current_collection: string,
    ageing_above_90days: string,
    sale_growth: string,
    last_month_sale_growth: string,
}
export type GetSalesAttendanceDto = {
    _id: string,
    employee: DropDownDto,
    date: string,
    attendance: string,
    new_visit: string,
    old_visit: string,
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