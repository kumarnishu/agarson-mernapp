
export type DropDownDto = {
    id: string,
    value: string,
    label: string
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

export type GetPaymentDto = {
    _id: string,
    active: boolean
    payment_title: string,
    payment_description: string,
    last_document?: GetPaymentDocumentDto,
    assigned_users: DropDownDto[],
    link: string,
    category: DropDownDto,
    frequency?: string,
    due_date: string,
    next_date: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type GetChecklistDto = {
    _id: string,
    active: boolean
    serial_no: string
    last_10_boxes: GetChecklistBoxDto[]
    work_title: string,
    work_description: string,
    photo: string,
    last_checked_box?: GetChecklistBoxDto,
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
    serial_no: string,
    work_description: string,
    category: string,
    link: string,
    assigned_users: string[]
    frequency?: string,
    photo: string
}
export type CreateOrEditPaymentDto = {
    payment_title: string,
    payment_description: string,
    category: string,
    link: string,
    duedate: string,
    assigned_users: string[]
    frequency: string,
}


export type GetPaymentDocumentDto = {
    _id: string,
    document: string,
    remark: string,
    payment: DropDownDto,
    date: string,
}

export type GetVisitSummaryReportRemarkDto = {
    _id: string,
    remark: string,
    employee: DropDownDto,
    visit_date: string,
    created_at: string,
    created_by: string
}
export type CreateOrEditVisitSummaryRemarkDto = {
    remark: string,
    employee: string,
    visit_date: string
}
export type GetChecklistBoxDto = {
    _id: string,
    stage: string,
    last_remark: string,
    checklist: DropDownDto,
    date: string,
}

export type GetChecklistFromExcelDto = {
    _id?: string,
    work_title: string,
    serial_no: string,
    work_description: string,
    category: string,
    link: string,
    assigned_users: string
    frequency: string,
    status?: string
}

export type GetPaymentsFromExcelDto = {
    _id?: string,
    payment_title: string,
    payment_description: string,
    category: string,
    link: string,
    assigned_users: string
    frequency?: string,
    duedate: string,
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
    alias1: string;
    alias2: string;
    state: string;
    assigned_users: string;
}
export type GetExpenseItemDto = {
    _id: string,
    item: string;
    category:DropDownDto,
    unit: DropDownDto;
    stock:number
}
export type GetExpenseTransactionDto={
    _id:string,
    item:DropDownDto,
    category: DropDownDto,
    unit: DropDownDto,
    movement:string,
    from:string,
    to:string,
    qty:number,
    created_by:DropDownDto,
    created_at:string
}

export type GetKeyDto = {
    _id: string,
    serial_no: number,
    key: string;
    category: DropDownDto;
    type: string;
    is_date_key: boolean,
    map_to_username: boolean,
    map_to_state: boolean,
    assigned_users: string;
}
export type GetKeyFromExcelDto = {
    _id?: string,
    serial_no: number,
    key: string,
    type: string,
    category: string,
    is_date_key: boolean,
    map_to_username: boolean,
    map_to_state: boolean,
    status?: string
}
export type GetCrmStateDto = {
    _id: string,
    state: string,
    alias1: string,
    alias2: string,
    assigned_users: string;
}

export type GetKeyCategoryDto = {
    _id: string,
    skip_bottom_rows: number,
    category: string,
    display_name: string,
    assigned_users: string;
}


export type GetCityFromExcelDto = {
    _id: string,
    city: string,
    status?: string
}

export type GetExpenseItemFromExcelDto = {
    _id: string,
    item: string,
    unit: string,
    category: string,
    status?: string
}

export type CreateOrEditCrmCity = {
    _id: string,
    state: string,
    alias1: string;
    alias2: string;
    city: string
}
export type CreateOrEditExpenseItem = {
    item: string,
    unit: string;
    stock:number,
    category:string
}


export type GetLeadFromExcelDto = {
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
    party_id: string,
    remark: string,
    remind_date: string
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
export type GetReferFromExcelDto = {
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
export type GetExcelDBRemarksDto = {
    _id: string,
    remark: string,
    next_date: string,
    created_date: string,
    created_by: string,
    category: DropDownDto,
    obj: string

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
    checklist_box: string,
    checklist: string
}
export type CreateOrEditExcelDbRemarkDto = {
    remark: string,
    category: string,
    obj: string,
    next_date?: string
}

export type CreateOrEditPaymentDocumentDto = {
    remark: string,
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
    alias1: string,
    alias2: string,
    email: string,
    password?: string,
    mobile: string,
}
export type GetUserDto = {
    _id: string,
    username: string,
    alias1: string,
    alias2: string,
    email: string,
    mobile: string,
    dp: string,
    orginal_password?: string,
    is_admin: Boolean,
    email_verified: Boolean,
    mobile_verified: Boolean,
    is_active: Boolean,
    last_login: string,
    is_multi_login: boolean,
    assigned_users: DropDownDto[]
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


export type GetSalesManVisitSummaryReportDto = {
    employee: DropDownDto,
    date1: string,
    old_visits1: number,
    new_visits1: number,
    working_time1: string,
    date2: string,
    old_visits2: number,
    new_visits2: number,
    working_time2: string,
    date3: string,
    old_visits3: number,
    new_visits3: number,
    working_time3: string,
    last_remark: string
}
export type GetSalesmanKpiDto = {
    employee?: DropDownDto,
    date: string,
    month: string,
    attendance?: string,
    new_visit?: number,
    old_visit?: number,
    working_time?: string,
    new_clients: number,
    station?: DropDownDto,
    state?: string,
    currentsale_currentyear: number,
    currentsale_last_year: number,
    lastsale_currentyear: number,
    lastsale_lastyear: number,
    current_collection: number,
    ageing_above_90days: number,
    sale_growth: number,
    last_month_sale_growth: number,
}

export type GetSalesAttendanceDto = {
    _id: string,
    employee: DropDownDto,
    date: string,
    attendance: string,
    new_visit: number,
    old_visit: number,
    remark: string,
    in_time: string,
    end_time: string,
    station: DropDownDto,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}

export type GetSalesAttendancesAuto={
    employee: DropDownDto,
    date: string,
    new_visit: number,
    old_visit: number,
    worktime: string,
}

export type CreateOrEditSalesAttendanceDto = {
    _id: string,
    employee: string,
    date: string,
    attendance: string,
    new_visit: number,
    old_visit: number,
    remark: string,
    in_time: string,
    end_time: string,
    station: string
}