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
    [key: string]: any ; // Index signature for dynamic reference columns
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
    amount: number
}
export type GetCollectionsDto = {
    _id: string,
    date: string,
    month: string,
    party: string,
    state: string,
    amount: number
}
export type GetAgeingDto = {
    _id: string,
    state: string,
    party: string,
    next_call?: string,
    last_remark?: string,
    two5: number,
    three0: number,
    five5: number,
    six0: number,
    seven0: number,
    seventyplus: number,
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
export type CreateOrEditReferenceRemarkDto = {
    remark: string,
    party: string,
    stage:string,
    next_date?: string
}
export type CreateReferenceExcelDto = {
    _id: string,
    date: string,
    gst: string,
    party: string,
    address: string,
    state: string,
    pincode: number,
    business: string,
    sale_scope: number,
    reference: string,
    status?: string
}
export type CreateSalesExcelDto = {
    _id: string,
    date: string,
    invoice_no: string,
    party: string,
    state: string,
    amount: number,
    status?: string
}
export type CreateCollectionsExcelDto = {
    _id: string,
    date: string,
    party: string,
    state: string,
    amount: number,
    status?: string
}
export type CreateAgeingExcelDto = {
    _id: string,
    state: string,
    party: string,
    next_call?: string,
    last_remark?: string,
    two5: number,
    three0: number,
    five5: number,
    six0: number,
    seven0: number,
    seventyplus: number,
    status?: string
}
export type CreateOrEditAgeingRemarkDto = {
    remark: string,
    party: string,
    nextcall?: string
}
export interface IColumn {
    key: string;
    header: string,
    type: string
}
export interface IRowData {
    [key: string]: any; // Type depends on your data
}
export interface IColumnRowData {
    columns: IColumn[];
    rows: IRowData[];
}
export type CreateOrEditVisitSummaryRemarkDto = {
    remark: string,
    employee: string,
    visit_date: string
}


