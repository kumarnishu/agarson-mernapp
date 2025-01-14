
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