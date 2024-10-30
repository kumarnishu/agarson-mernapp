export type DropDownDto = {
    id: string,
    value: string,
    label: string
}
export type CreateOrEditDropDownDto = {
    id: string,
    key: string
}

export type IPermission = {
    value: string,
    label: string
}
export type IMenu = {
    label: string,
    menues?: IMenu[],
    permissions: IPermission[]
}
export type CreateOrEditChecklistCategoryDto = {
    category: string
}


export type GetChecklistDto = {
    _id: string,
    active: boolean
    work_title: string,
    work_description: string,
    photo: string,
    last_checked_date:string,
    assigned_users: DropDownDto[],
    link: string,
    category: DropDownDto,
    frequency: string,
    next_date: string,
    boxes: GetChecklistBoxDto[],
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type CreateOrEditChecklistDto = {
    work_title: string,
    work_description: string,
    category: string,
    link: string,
    assigned_users:string[]
    frequency: string,
    photo: string
}

export type GetChecklistBoxDto = {
    _id: string,
    stage: string,
    checklist: DropDownDto,
    date: string,
}

export type GetChecklistFromExcelDto = {
    work_title: string,
    person: string,
    category: string,
    frequency: string,
    next_checkin_date: string,
    status?: string
}


export type MergeTwoLeadsDto = {
    name: string,
    mobiles: string[],
    city: string,
    state: string,
    stage: string,
    email: string,
    alternate_email: string,
    address: string,
    merge_refer: boolean,
    merge_remarks: boolean,
    source_lead_id: string,
    refer_id: string
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

export type CreateAndUpdatesLeadFromExcelDto = {
    _id: string,
    name: string,
    customer_name: string,
    customer_designation: string,
    gst: string,
    mobile: string,
    email: string,
    city: string,
    state: string,
    country: string,
    address: string,
    work_description: string,
    turnover: string,
    alternate_mobile1: string,
    alternate_mobile2: string,
    alternate_email: string,
    lead_type: string
    stage: string
    lead_source: string
    status?: string
}


export type GetLeadDto = {
    _id: string,
    name: string,
    customer_name: string,
    customer_designation: string,
    mobile: string,
    gst: string,
    has_card: boolean,
    email: string,
    city: string,
    state: string,
    country: string,
    address: string,
    work_description: string,
    turnover: string,
    alternate_mobile1: string,
    alternate_mobile2: string,
    alternate_email: string,
    lead_type: string
    stage: string
    lead_source: string
    visiting_card: string,
    referred_party_name?: string,
    referred_party_mobile?: string,
    referred_date?: string,
    last_remark: string,
    uploaded_bills: number,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type CreateOrEditLeadDto = {
    name: string,
    customer_name: string,
    customer_designation: string,
    mobile: string,
    email: string
    gst: string
    city: string,
    state: string,
    country: string,
    address: string,
    remark: string,
    work_description: string,
    turnover: string,
    lead_type: string,
    alternate_mobile1: string,
    alternate_mobile2: string,
    alternate_email: string,
    lead_source: string,
}
export type CreateOrRemoveReferForLeadDto = {
    party_id: string, remark: string, remind_date: string
}

export type CreateOrEditMergeLeadsDto = {
    name: string,
    mobiles: string[],
    city: string,
    state: string,
    stage: string,
    email: string,
    alternate_email: string,
    address: string,
    merge_refer: boolean,
    merge_remarks: boolean,
    source_lead_id: string,
    merge_bills: boolean
}
export type CreateOrEditMergeRefersDto = {
    name: string,
    mobiles: string[],
    city: string,
    state: string,
    address: string,
    merge_assigned_refers: boolean,
    merge_remarks: boolean,
    source_refer_id: string,
    merge_bills: boolean
}
export type GetReferDto = {
    _id: string,
    name: string,
    customer_name: string,
    mobile: string,
    mobile2: string,
    mobile3: string,
    address: string,
    gst: string,
    last_remark: string,
    uploaded_bills: number,
    refers: number,
    city: string,
    state: string,
    convertedfromlead: boolean,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}

export type CreateOrEditReferDto = {
    _id: string,
    name: string,
    customer_name: string,
    mobile: string,
    mobile2: string,
    mobile3: string,
    address: string,
    gst: string,
    city: string,
    state: string
}
export type CreateOrEditReferFromExcelDto = {
    _id: string,
    name: string,
    customer_name: string,
    mobile: string,
    mobile2: string,
    mobile3: string,
    address: string,
    gst: string,
    city: string,
    state: string,
    status?: string
}
export type GetRemarksDto = {
    _id: string,
    remark: string,
    lead_id?: string,
    lead_name?: string,
    lead_mobile?: string,
    refer_id?: string,
    refer_name?: string,
    refer_mobile?: string,
    remind_date: string,
    created_date: string,
    created_by: DropDownDto

}
export type GetChecklistRemarksDto = {
    _id: string,
    remark: string,
    checklist_box: DropDownDto,
    created_date: string,
    created_by: DropDownDto

}

export type GetActivitiesTopBarDetailsDto = { stage: string, value: number }
export type GetActivitiesOrRemindersDto = {
    _id: string,
    remark: string,
    remind_date?: string,
    created_at: string,
    created_by: DropDownDto,
    lead_id: string,
    name: string,
    customer_name: string,
    customer_designation: string,
    mobile: string,
    gst: string,
    has_card: boolean,
    email: string,
    city: string,
    state: string,
    country: string,
    address: string,
    work_description: string,
    turnover: string,
    alternate_mobile1: string,
    alternate_mobile2: string,
    alternate_email: string,
    lead_type: string
    stage: string
    lead_source: string
    visiting_card: string,
    referred_party_name?: string,
    referred_party_mobile?: string,
    referred_date?: string

}

export type GetBillItemDto = {
    _id: string,
    article: DropDownDto,
    qty: number,
    rate: number,
    bill: DropDownDto,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto

}
export type CreateOrEditBillItemDto = {
    _id?: string,
    article: string,
    qty: number,
    rate: number,
}

export type GetBillDto = {
    _id: string,
    items: CreateOrEditBillItemDto[],
    lead?: DropDownDto,
    billphoto: string,
    refer?: DropDownDto,
    bill_no: string,
    bill_date: string,
    remarks: string,
    created_at: Date,
    updated_at: Date,
    created_by: DropDownDto,
    updated_by: DropDownDto

}
export type CreateOrEditBillDto = {
    items: CreateOrEditBillItemDto[],
    lead: string,
    billphoto: string,
    remarks: string,
    refer: string,
    bill_no: string,
    bill_date: string,
}

export type CreateOrEditRemarkDto = {
    remark: string,
    remind_date: string,
    stage: string,
    has_card: boolean
}

export type CreateOrEditChecklistRemarkDto = {
    remark: string,
    stage: string,
    checklist_box:string,
    checklist:string
}

export type GetErpEmployeeDto = {
    _id: string,
    name: string,
    display_name: string,
    assigned_employees: string,
    created_at: string,
    updated_at: string,
    created_by: string,
    updated_by: string
}

export type GetVisitReportDto = {
    _id: string,
    employee: string
    visit_date: string,
    customer: string,
    intime: string,
    outtime: string,
    visitInLocation: string,
    visitOutLocation: string,
    remarks: string,
    created_at: string,
    updated_at: string,
    created_by: string,
    updated_by: string,
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
export type CreateOrEditErpEmployeeDto = {
    name: string,
    display_name: string,
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
export type GetPendingOrdersReportDto = {
    _id: string,
    report_owner: DropDownDto
    account: string,
    product_family: string,
    article: string,
    size5: number,
    size6: number,
    size7: number,
    size8: number,
    size9: number,
    size10: number,
    size11: number,
    size12_24pairs: number,
    size13: number,
    size11x12: number,
    size3: number,
    size4: number,
    size6to10: number,
    size7to10: number,
    size8to10: number,
    size4to8: number,
    size6to9: number,
    size5to8: number,
    size6to10A: number,
    size7to10B: number,
    size6to9A: number,
    size11close: number,
    size11to13: number,
    size3to8: number,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto,
    status?: string
}
export type GetPartyTargetReportDto = {
    _id: string,
    slno: string,
    PARTY: string,
    Create_string: string,
    STATION: string,
    SALES_OWNER: string,
    report_owner: DropDownDto
    All_TARGET: string,
    TARGET: number,
    PROJECTION: number,
    GROWTH: number,
    TARGET_ACHIEVE: number,
    TOTAL_SALE_OLD: number,
    TOTAL_SALE_NEW: number,
    Last_Apr: number,
    Cur_Apr: number,
    Last_May: number,
    Cur_May: number,
    Last_Jun: number,
    Cur_Jun: number,
    Last_Jul: number,
    Cur_Jul: number,
    Last_Aug: number,
    Cur_Aug: number,
    Last_Sep: number,
    Cur_Sep: number,
    Last_Oct: number,
    Cur_Oct: number,
    Last_Nov: number,
    Cur_Nov: number,
    Last_Dec: number,
    Cur_Dec: number,
    Last_Jan: number,
    Cur_Jan: number,
    Last_Feb: number,
    Cur_Feb: number,
    Last_Mar: number,
    Cur_Mar: number,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto,
    status?: string
}
export type GetClientSaleLastYearReportDto = {
    _id: string,
    report_owner: DropDownDto
    account: string,
    article: string,
    oldqty: number,
    newqty: number,
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
    status?: string
}
export type GetBillsAgingReportDto = {
    _id: string,
    report_owner: DropDownDto
    account: string,
    plu70: number,
    in70to90: number,
    in90to120: number,
    plus120: number
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto,
    status?: string
}

export type GetErpStateFromExcelDto = {
    _id?: string,
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
    status?: any
}



export type GetSaleAnalysisReportDto = {
    state: string,
    monthly_target: number,
    monthly_achivement: number,
    monthly_percentage: number,
    annual_target: number,
    annual_achivement: number,
    annual_percentage: number,
    last_year_sale: number,
    last_year_sale_percentage_comparison: number
}
export type GetPartyTargetReportFromExcelDto = {
    slno: string,
    PARTY: string,
    Create_Date: string,
    STATION: string,
    SALES_OWNER: string,
    report_owner: string
    All_TARGET: string,
    TARGET: number,
    PROJECTION: number,
    GROWTH: number,
    TARGET_ACHIEVE: number,
    TOTAL_SALE_OLD: number,
    TOTAL_SALE_NEW: number,
    Last_Apr: number,
    Cur_Apr: number,
    Last_May: number,
    Cur_May: number,
    Last_Jun: number,
    Cur_Jun: number,
    Last_Jul: number,
    Cur_Jul: number,
    Last_Aug: number,
    Cur_Aug: number,
    Last_Sep: number,
    Cur_Sep: number,
    Last_Oct: number,
    Cur_Oct: number,
    Last_Nov: number,
    Cur_Nov: number,
    Last_Dec: number,
    Cur_Dec: number,
    Last_Jan: number,
    Cur_Jan: number,
    Last_Feb: number,
    Cur_Feb: number,
    Last_Mar: number,
    Cur_Mar: number,
    status?: string,
    created_at?: string,
}



export type GetBillsAgingReportFromExcelDto = {
    report_owner: string
    account: string,
    total?: number,
    plu70: number,
    in70to90: number,
    in90to120: number,
    plus120: number
    status?: string,
    created_at?: string,
}
export type GetPendingOrdersReportFromExcelDto = {
    report_owner: string
    account: string,
    product_family: string,
    article: string,
    total?: number,
    size5: number,
    size6: number,
    size7: number,
    size8: number,
    size9: number,
    size10: number,
    size11: number,
    size12_24pairs: number,
    size13: number,
    size11x12: number,
    size3: number,
    size4: number,
    size6to10: number,
    size7to10: number,
    size8to10: number,
    size4to8: number,
    size6to9: number,
    size5to8: number,
    size6to10A: number,
    size7to10B: number,
    size6to9A: number,
    size11close: number,
    size11to13: number,
    size3to8: number,
    status?: string, created_at?: string,
}

export type GetClientSaleReportFromExcelDto = {
    report_owner: string,
    account: string,
    article: string,
    oldqty: number,
    newqty: number,
    total?: number,
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
    status?: string,
    created_at?: string,
}

export type GetVisitReportFromExcelDto = {
    _id: string,
    employee: string
    visit_date: string,
    customer: string,
    intime: string,
    outtime: string,
    visitInLocation: string,
    visitOutLocation: string,
    remarks: string,
    status?: string
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
export type createOrEditUserDto = {
    username: string,
    email: string,
    password?: string,
    mobile: string,
}
export type GetUserDto = {
    _id: string,
    username: string,
    email: string,
    mobile: string,
    dp: string,
    orginal_password?: string,
    is_admin: Boolean,
    email_verified: Boolean,
    mobile_verified: Boolean,
    show_only_visiting_card_leads: boolean,
    is_active: Boolean,
    last_login: string,
    is_multi_login: boolean,
    assigned_users: DropDownDto[]
    assigned_states: number,
    assigned_erpEmployees: number,
    assigned_crm_states: number,
    assigned_crm_cities: number,
    assigned_permissions: string[],
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}



export type LoginDto = {
    username: string,
    password: string,
    multi_login_token: string
}

export type AssignUsersDto = {
    ids: string[]
}
export type UpdateProfileDto = {
    email: string,
    mobile: string
}
export type UpdatePasswordDto = {
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
}
export type ResetPasswordDto = {
    newPassword: string,
    confirmPassword: string
}
export type VerifyEmailDto = {
    email: string
}

export type AssignPermissionForOneUserDto = {
    permissions: string[],
    user_id: string
}
export type AssignPermissionForMultipleUserDto = {
    permissions: string[],
    user_ids: string[],
    flag: number
}