import { GetChecklistBoxDto } from "./checklist-box.dto"
import { DropDownDto } from "./dropdown.dto"

export type GetChecklistDto = {
    _id: string,
    active: boolean
    serial_no: string
    last_10_boxes: GetChecklistBoxDto[]
    work_title: string,
    work_description: string,
    photo: string,
    last_checked_box?: GetChecklistBoxDto,
    assigned_users: DropDownDto[],
    link: string,
    category: DropDownDto,
    frequency: string,
    next_date: string,
    boxes: GetChecklistBoxDto[],
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type CreateOrEditChecklistDto = {
    work_title: string,
    serial_no: string,
    work_description: string,
    category: string,
    link: string,
    assigned_users: string[]
    frequency?: string,
    photo: string
}
export type GetChecklistFromExcelDto = {
    _id?: string,
    work_title: string,
    serial_no: string,
    work_description: string,
    category: string,
    link: string,
    assigned_users: string
    frequency: string,
    status?: string
}