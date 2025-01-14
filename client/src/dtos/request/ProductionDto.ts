export type CreateOrEditShoeWeightDto = {
    machine: string,
    dye: string,
    article: string,
    weight: number,
    upper_weight: number,
    month: number,
}
export type CreateOrEditSoleThicknessDto = {
    dye: string,
    article: string,
    size: string,
    left_thickness: number,
    right_thickness: number,
}
export type CreateOrEditSpareDyeDto = {
    dye: string,
    repair_required: boolean,
    location: string,
    remarks: string,
    dye_photo: string
}
export type CreateOrEditProductionDto = {
    machine: string,
    date: string,
    production_hours: number,
    thekedar: string,
    articles: string[],
    manpower: number,
    production: number,
    big_repair: number,
    small_repair: number,
    upper_damage: number
}