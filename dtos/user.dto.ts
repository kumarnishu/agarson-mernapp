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
    assigned_erpEmployees:number,
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
    flag:number
}