import { ICRMState, ICRMCity, IKey, IKeyCategory } from "./AuthorizationInterface";


export type Asset = {
  _id: string,
  filename: string,
  public_url: string,
  content_type: string,
  size: string,
  bucket: string,
  created_at: Date
} | undefined


export type IUser = {
  _id: string,
  username: string,
  alias1: string,
  alias2: string,
  password: string,
  email: string,
  mobile: string,
  dp: Asset,
  client_id: string,
  orginal_password: string,
  connected_number: string,
  is_admin: Boolean,
  email_verified: Boolean,
  mobile_verified: Boolean,
  access_token: string,
  is_active: Boolean,
  last_login: Date,
  impersonated_user: IUser
  multi_login_token: string | null,
  is_multi_login: boolean,
  assigned_users: IUser[]
  assigned_crm_states: ICRMState[]
  assigned_crm_cities: ICRMCity[],
  assigned_permissions: string[],
  assigned_keys: IKey[],
  assigned_keycategories: IKeyCategory[],
  created_at: Date,
  updated_at: Date,
  created_by: IUser,
  updated_by: IUser
  resetPasswordToken: string | null,
  resetPasswordExpire: Date | null,
  emailVerifyToken: string | null,
  emailVerifyExpire: Date | null
}
export type IUserMethods = {
  getAccessToken: () => string,
  comparePassword: (password: string) => boolean,
  getResetPasswordToken: () => string,
  getEmailVerifyToken: () => string
}
