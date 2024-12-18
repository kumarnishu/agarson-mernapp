import { DropDownDto } from "./dropdown.dto"

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
  impersonated_user?: DropDownDto,
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