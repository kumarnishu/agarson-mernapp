import { DropDownDto } from "./dropdown.dto"

export type GetChecklistRemarksDto = {
    _id: string,
    remark: string,
    checklist_box: DropDownDto,
    created_date: string,
    created_by: DropDownDto

}
export type CreateOrEditChecklistRemarkDto = {
    remark: string,
    stage: string,
    checklist_box: string,
    checklist: string
}