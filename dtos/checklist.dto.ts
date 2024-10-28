import { DropDownDto } from "./dropdown.dto"


export type CreateOrEditChecklistCategoryDto = {
    category: string
}


export type GetChecklistDto = {
    _id: string,
    category: DropDownDto,
    work_title: string,
    link: string,
    user: DropDownDto,
    end_date: string,
    done_date:string,
    next_date:string,
    frequency: string,
    photo: string,
    boxes: GetChecklistBoxDto[],
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type CreateOrEditChecklistDto = {
    category: string,
    work_title: string,
    photo: string,
    link: string,
    end_date: string,
    next_date: string,
    user_id: string,
    frequency: string,
}

export type GetChecklistBoxDto = {
    _id: string,
    date: string,
    checked: boolean,
    remarks: string,
}

export type GetChecklistFromExcelDto={
    work_title:string,
    person:string,
    category:string,
    frequency:string,
    next_checkin_date:string,
    status?:string
}