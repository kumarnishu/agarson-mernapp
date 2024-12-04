import { DropDownDto } from "./dropdown.dto"

export type GetVisitSummaryReportRemarkDto = {
    _id: string,
    remark: string,
    employee: DropDownDto,
    visit_date: string,
    created_at: string,
    created_by: string
}
export type CreateOrEditVisitSummaryRemarkDto = {
    remark: string,
    employee: string,
    visit_date: string
}