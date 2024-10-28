import { IArticle, IChecklistCategory, ICRMCity, ICRMState, IDye, IDyeLocation, IErpEmployee, IMachine, IMaintenanceCategory, IState } from "./dropdown.interface"

export interface Asset {
    _id: string,
    filename: string,
    public_url: string,
    content_type: string,
    size: string,
    bucket: string,
    created_at: Date
} 
export interface IUser {
    _id: string,
    username: string,
    password: string,
    email: string,
    mobile: string,
    dp: Asset,
    orginal_password: string,
    is_admin: Boolean,
    email_verified: Boolean,
    mobile_verified: Boolean,
    show_only_visiting_card_leads: boolean,
    is_active: Boolean,
    last_login: Date,
    multi_login_token: string | null,
    is_multi_login: boolean,
    assigned_users: IUser[]
    assigned_states: IState[]
    assigned_erpEmployees: IErpEmployee[]
    assigned_crm_states: ICRMState[]
    assigned_crm_cities: ICRMCity[],
    assigned_permissions: string[],
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
    resetPasswordToken: string | null,
    resetPasswordExpire: Date | null,
    emailVerifyToken: string | null,
    emailVerifyExpire: Date | null
}
export interface IUserMethods {
    getAccessToken: () => string,
    comparePassword: (password: string) => boolean,
    getResetPasswordToken: () => string,
    getEmailVerifyToken: () => string
}
export interface ILead {
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
    lead_source: string,
    last_remark: string,
    uploaded_bills: number,
    visiting_card: Asset,
    referred_party?: IReferredParty,
    referred_date?: Date,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
export interface IReferredParty {
    _id: string,
    name: string,
    customer_name: string,
    mobile: string,
    mobile2: string,
    mobile3: string,
    address: string,
    last_remark: string,
    uploaded_bills: number,
    refers: number,
    gst: string,
    city: string,
    state: string,
    convertedfromlead: boolean,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
export interface IRemark {
    _id: string,
    remark: string,
    lead: ILead,
    refer: IReferredParty,
    created_at: Date,
    remind_date: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
export interface IBillItem {
    _id: string,
    article: IArticle,
    qty: number,
    rate: number,
    bill: IBill,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
export interface IBill {
    _id: string,
    lead: ILead,
    billphoto: Asset,
    refer: IReferredParty,
    bill_no: string,
    remarks: string,
    bill_date: Date,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


export interface IProduction {
    _id: string,
    machine: IMachine,
    thekedar: IUser,
    articles: IArticle[],
    manpower: number,
    production: number,
    big_repair: number,
    upper_damage: number,
    small_repair: number,
    date: Date,
    production_hours: number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
export interface IShoeWeight {
    _id: string,
    machine: IMachine,
    dye: IDye,
    article: IArticle,
    is_validated: boolean,
    month: number,
    shoe_weight1: number,
    shoe_photo1: Asset,
    weighttime1: Date,
    weighttime2: Date,
    weighttime3: Date,
    upper_weight1: number,
    upper_weight2: number,
    upper_weight3: number,
    shoe_weight2: number,
    shoe_photo2: Asset,
    shoe_weight3: number,
    shoe_photo3: Asset,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
export interface ISoleThickness {
    _id: string,
    dye: IDye,
    article: IArticle,
    size: string,
    left_thickness: number,
    right_thickness: number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
export interface ISpareDye {
    _id: string,
    dye: IDye,
    repair_required: boolean,
    dye_photo: Asset,
    remarks: string,
    is_validated: boolean,
    photo_time: Date,
    location: IDyeLocation,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export interface IChecklist {
    _id: string,
    link: string,
    category: IChecklistCategory,
    work_title: string,
    photo: Asset,
    user: IUser,
    frequency: string,
    end_date: Date,
    next_date: Date,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
export interface IChecklistBox {
    _id: string,
    date: Date,
    remarks: string,
    checked: boolean,
    checklist: IChecklist,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
export interface IMaintenanceItem {
    _id: string,
    machine: IMachine,
    other: string,
    is_required: boolean,
    stage: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
export interface IMaintenance {
    _id: string,
    work: string,
    active: boolean,
    category: IMaintenanceCategory,
    frequency: string,
    user: IUser,
    item: string,
    items: IMaintenanceItem[]
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}