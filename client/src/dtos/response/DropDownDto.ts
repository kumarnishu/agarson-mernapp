
export type DropDownDto = {
    id: string,
    label: string
}
export type GetChecklistCategoryDto = {
    _id: string,
    category: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type GetArticleDto = {
    _id: string,
    name: string,
    active: boolean,
    display_name: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type GetLeadTypeDto = {
    _id: string,
    type: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type GetLeadSourceDto = {
    _id: string,
    source: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type GetStageDto = {
    _id: string,
    stage: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type GetCrmStateDto = {
    _id: string,
    state: string,
    alias1: string,
    alias2: string,
    assigned_users: string;
}
export type GetDyeLocationDto = {
    _id: string,
    name: string,
    active: boolean,
    display_name: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type GetDyeDto = {
    _id: string,
    active: boolean,
    dye_number: number,
    size: string,
    articles: DropDownDto[],
    stdshoe_weight: number,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type GetDyeStatusReportDto = {
    _id: string,
    dye: number,
    article: string,
    size: string,
    std_weight: number,
    location: string,
    repair_required: string,
    remarks: string,
    created_at: string,
    created_by: DropDownDto,

}
export type GetExpenseCategoryDto = {
    _id: string,
    category: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type GetExpenseLocationDto = {
    _id: string,
    name: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type GetItemUnitDto = {
    _id: string,
    unit: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type GetKeyCategoryDto = {
    _id: string,
    skip_bottom_rows: number,
    category: string,
    display_name: string,
    assigned_users: string;
}
export type GetMachineCategoryDto = {
    _id: string,
    category: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type GetMachineDto = {
    _id: string,
    name: string,
    active: boolean,
    category: string,
    serial_no: number,
    display_name: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
