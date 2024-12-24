import { GetChecklistBoxDto } from "./checklist-box.dto"
import { DropDownDto } from "./dropdown.dto"

export type GetChecklistDto = {
    _id: string,
    active: boolean
    serial_no: string
    last_10_boxes: GetChecklistBoxDto[]
    score:number
    work_title: string,
    group_title: string,
    photo: string,
    last_checked_box?: GetChecklistBoxDto,
    assigned_users: DropDownDto[],
    link: string,
    category: DropDownDto,
    frequency: string,
    next_date: string,
    last_remark:string,
    boxes: GetChecklistBoxDto[],
    created_at: string,
    condition:string,
    expected_number:number,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type CreateOrEditChecklistDto = {
    work_title: string,
    serial_no: string,
    group_title: string,
    category: string,
    link: string,
    assigned_users: string[]
    frequency?: string,
    condition:string,
    expected_number:number,
    photo: string
}
export type GetChecklistFromExcelDto = {
    _id?: string,
    work_title: string,
    serial_no: string,
    group_title: string,
    category: string,
    link: string,
    assigned_users: string
    frequency: string,
    condition:string,
    expected_number:number,
    status?: string
}