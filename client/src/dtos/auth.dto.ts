
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