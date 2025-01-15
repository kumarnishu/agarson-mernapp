import { DropDownDto } from "./DropDownDto"

//Response dto
export type GroupedChecklistDto = {
    group_title: string, // The grouping key
    checklists: GetChecklistDto[] // Array of checklists within this group
}
export type GetChecklistTopBarDto = {
    categorydData: { category: string, count: number }[],
    lastmonthscore: number,
    currentmonthscore: number
}
export type GetChecklistDto = {
    _id: string,
    active: boolean
    serial_no: number
    last_10_boxes: GetChecklistBoxDto[]
    work_title: string,
    group_title: string,
    photo: string,
    last_checked_box?: GetChecklistBoxDto,
    assigned_users: DropDownDto[],
    assigned_usersnames: string
    link: string,
    category: DropDownDto,
    frequency: string,
    next_date: string,
    today_score: number
    filtered_score: number
    last_remark: string,
    boxes: GetChecklistBoxDto[],
    created_at: string,
    condition: string,
    expected_number: number,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type GetChecklistRemarksDto = {
    _id: string,
    remark: string,
    checklist_box: DropDownDto,
    created_date: string,
    created_by: DropDownDto

}
export type GetChecklistBoxDto = {
    _id: string,
    stage: string,
    score:number,
    last_remark: string,
    checklist: DropDownDto,
    date: string,
}

//Request dto
export type CreateChecklistFromExcelDto = {
    _id?: string,
    work_title: string,
    serial_no: number,
    group_title: string,
    category: string,
    link: string,
    assigned_users: string
    frequency: string,
    condition: string,
    expected_number: number,
    status?: string
}
export type CreateOrEditChecklistDto = {
    work_title: string,
    serial_no: number,
    group_title: string,
    category: string,
    link: string,
    assigned_users: string[]
    frequency?: string,
    condition: string,
    expected_number: number,
    photo: string
}
export type CreateOrEditChecklistRemarkDto = {
    remark: string,
    stage: string,
    score:number,
    checklist_box: string,
    checklist: string
}