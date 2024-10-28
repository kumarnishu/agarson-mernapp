export type DropDownDto = {
    id: string,
    value: string,
    label: string
}

export type GetCrmCityDto = {
    _id: string,
    city: string;
    state: string;
    assigned_users: string;
}
export type GetCrmStateDto = {
    _id: string,
    state: string,
    assigned_users: string;
}

export type AssignOrRemoveCrmCityDto = {
    user_ids: string[],
    city_ids: string[],
    flag: number
}
export type AssignOrRemoveCrmStateDto = {
    user_ids: string[],
    state_ids: string[],
    flag: number
}

export type CreateAndUpdatesStateFromExcelDto = {
    _id: string,
    state: string,
    users?: string,
    status?: string
}
export type CreateAndUpdatesCityFromExcelDto = {
    _id: string,
    city: string,
    users?: string,
    status?: string
}
export type CreateOrEditCrmCity = {
    id: string,
    state: string,
    city: string
}


export type GetErpEmployeeDto = {
    _id: string,
    name: string,
    assigned_employees: string,
    created_at: string,
    updated_at: string,
    created_by: string,
    updated_by: string
}



export type GetErpStateDto = {
    _id: string,
    state: string,
    apr: number,
    may: number,
    jun: number,
    jul: number,
    aug: number,
    sep: number,
    oct: number,
    nov: number,
    dec: number,
    jan: number,
    feb: number,
    mar: number,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto,
    assigned_users: string
}

export type CreateOrEditErpStateDto = {
    state: string,
    apr: number,
    may: number,
    jun: number,
    jul: number,
    aug: number,
    sep: number,
    oct: number,
    nov: number,
    dec: number,
    jan: number,
    feb: number,
    mar: number
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
    boxes?: {
        dt1: string,
        dt2: string,
        checked: boolean
    }[],
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
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}

export type GetDyeLocationDto = {
    _id: string,
    name: string,
    active: boolean,
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
    size: string,
    std_weight: number,
    location: string,
    repair_required: string,
    remarks: string,
    created_at: string,
    created_by: DropDownDto,

}


export type GetMachineDto = {
    _id: string,
    name: string,
    active: boolean,
    category: string,
    serial_no: number,
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

export type CreateOrEditMachineDto = {
    name: string,
    serial_no: number,
    category: string
}
export type CreateOrEditDyeDTo = {
    dye_number: number, size: string, articles: string[], st_weight: number
}
export type CreateOrEditDyeDtoFromExcel = {
    dye_number: number, size: string, articles: string, st_weight: number
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
