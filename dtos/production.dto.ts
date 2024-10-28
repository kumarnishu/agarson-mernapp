import { DropDownDto } from "./dropdown.dto"

export type GetSoleThicknessDto = {
    _id:string,
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

export type CreateOrEditSoleThicknessDto = {
    dye: string,
    article: string,
    size: string,
    left_thickness: number,
    right_thickness: number,
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
export type GetDyeStatusReportDto = {
    _id: string,
    dye: number,
    article: string,
    size:string,
    std_weight:number,
    location:string,
    repair_required:string,
    remarks:string,
    created_at: string,
    created_by: DropDownDto,

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
export type GetShoeWeightDto = {
    _id: string,
    machine: DropDownDto
    dye: DropDownDto
    article: DropDownDto
    is_validated: boolean,
    month: number,
    size:string,
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

export type CreateOrEditMachineDto = {
    name: string,
    display_name: string,
    serial_no: number,
    category: string
}
export type CreateOrEditDyeDTo = {
    dye_number: number, size: string, articles: string[], st_weight: number
}
export type CreateOrEditDyeDtoFromExcel = {
    dye_number: number, size: string, articles: string, st_weight: number
}
export type CreateOrEditArticleDto = {
    name: string, display_name: string
}
export type CreateOrEditDyeLocationDto = {
    name: string, display_name: string
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
export type CreateOrEditShoeWeightDto = {
    machine: string,
    dye: string,
    article: string,
    weight: number,
    upper_weight: number,
    month: number,
}
export type CreateOrEditSpareDyeDto = {
    dye: string,
    repair_required: boolean,
    location: string,
    remarks: string,
    dye_photo: string
}
export interface IColumn {
    key: string;
    header: string,
    type: string
}
export interface IRowData {
    [key: string]: any; // Type depends on your data
}

export interface IColumnRowData {
    columns: IColumn[];
    rows: IRowData[];
}
export type GetCategoryWiseProductionReportDto = {
    date: string,
    total: number,
    verticalpluslympha: number,
    pu: number,
    gumboot: number
}
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