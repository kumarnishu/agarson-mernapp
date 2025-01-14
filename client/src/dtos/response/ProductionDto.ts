import { DropDownDto } from "./DropDownDto"

//Response dto
export type GetShoeWeightDiffReportDto = {
    date: string,
    dye_no: number,
    article: string,
    size: string,
    st_weight: number,
    machine: string,
    w1: number,
    w2: number,
    w3: number,
    u1: number,
    u2: number,
    u3: number,
    d1: number,
    d2: number,
    d3: number,
    person: string
}
export type GetSoleThicknessDto = {
    _id: string,
    dye: DropDownDto,
    article: DropDownDto,
    size: string,
    left_thickness: number,
    right_thickness: number,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type GetSpareDyeDto = {
    _id: string,
    dye: DropDownDto,
    repair_required: boolean,
    dye_photo: string,
    is_validated: boolean,
    photo_time: string,
    remarks: string,
    location: DropDownDto,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type GetProductionDto = {
    _id: string,
    machine: DropDownDto,
    thekedar: DropDownDto,
    articles: DropDownDto[],
    manpower: number,
    production: number,
    big_repair: number,
    upper_damage: number,
    small_repair: number,
    date: string,
    production_hours: number,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type GetCategoryWiseProductionReportDto = {
    date: string,
    total: number,
    verticalpluslympha: number,
    pu: number,
    gumboot: number
}
export type GetShoeWeightDto = {
    _id: string,
    machine: DropDownDto
    dye: DropDownDto
    article: DropDownDto
    is_validated: boolean,
    month: number,
    size: string,
    shoe_weight1: number,
    shoe_photo1: string,
    std_weigtht: number,
    weighttime1: string,
    weighttime2: string,
    weighttime3: string,
    upper_weight1: number,
    upper_weight2: number,
    upper_weight3: number,
    shoe_weight2: number,
    shoe_photo2: string,
    shoe_weight3: number,
    shoe_photo3: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto
    updated_by: DropDownDto
}
