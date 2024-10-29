import { DropDownDto } from "../common/dropdown.dto"

export type CreateOrEditMaintenanceCategoryDto = {
    category: string
}

export type GetMaintenanceDto = {
    _id: string,
    work: string,
    active: boolean,
    category: DropDownDto,
    frequency: string,
    user: DropDownDto,
    items: GetMaintenanceItemDto[],
    item: string,
    created_at: string,
    updated_at: string,
    created_by: string,
    updated_by: string
}


export type CreateOrEditMaintenanceDto = {
    work: string,
    category: string,
    frequency: string,
    user: string,
    maintainable_item: string,
}

export type GetMaintenanceItemDto = {
    _id: string,
    item: string,
    stage?: string,
    is_required: boolean
}

export type CreateMaintenanceFromExcelDto = {
    work: string,
    category: string,
    frequency: string,
    user: string,
    maintainable_item: string,
    status?: string
}

export type GetMaintenanceItemRemarkDto = {
    _id: string,
    remark: string,
    created_at: string,
    created_by: string
}