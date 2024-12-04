import { DropDownDto } from "./dropdown.dto"

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
export type CreateOrEditDyeDTo = {
    dye_number: number,
    size: string,
    articles: string[],
    st_weight: number
}
export type GetDyeDtoFromExcel = {
    dye_number: number,
    size: string,
    articles: string,
    st_weight: number
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