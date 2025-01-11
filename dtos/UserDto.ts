import { DropDownDto } from "./DropDownDto"

export type LoginDto = {
  username: string,
  password: string,
  multi_login_token: string
}
export type GetLoginByThisUserDto={
  user_id:string,
  impersnate_id:string
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

export type createOrEditUserDto = {
  username: string,
  alias1: string,
  alias2: string,
  email: string,
  password?: string,
  mobile: string,
}

export type GetImpersantedUserdto = {
  _id: string,
  username: string,
  is_admin: boolean
}
export type GetUserDto = {
  _id: string,
  username: string,
  alias1: string,
  impersonated_user?: GetImpersantedUserdto,
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