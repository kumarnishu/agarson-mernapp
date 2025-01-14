import { IChecklistCategory } from "./DropDownInterface";
import { IUser, Asset } from "./UserInterface";


export type IChecklistBox = {
    _id: string,
    date: Date,
    stage: string,
    last_remark: string,
    score: number
    checklist: IChecklist,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export type IChecklistRemark = {
    _id: string,
    remark: string,
    checklist_box:IChecklistBox,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export type IChecklist = {
    _id: string,
    active: boolean
    work_title: string,
    condition: string // 'check-blank'||'check_yesno'||'check_expected_number',
    expected_number: number,
    group_title: string,
    last_remark: string,
    photo: Asset,
    serial_no: number,
    assigned_users: IUser[],
    last_10_boxes: IChecklistBox[]
    lastcheckedbox: IChecklistBox,
    checklist_boxes: IChecklistBox[]
    link: string,
    category: IChecklistCategory,
    frequency: string,
    next_date: Date,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

