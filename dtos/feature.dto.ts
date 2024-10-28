import { DropDownDto } from "./dropdown.dto"

export type createOrEditUserDto = {
    username: string,
    email: string,
    password?: string,
    mobile: string,
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


export type GetChecklistDto = {
    _id: string,
    category: DropDownDto,
    work_title: string,
    link: string,
    user: DropDownDto,
    end_date: string,
    done_date: string,
    next_date: string,
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