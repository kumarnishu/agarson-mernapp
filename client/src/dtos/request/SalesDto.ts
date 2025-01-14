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


