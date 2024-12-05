export type IPermission = {
    value: string,
    label: string
}
export type IMenu = {
    label: string,
    menues?: IMenu[],
    permissions: IPermission[]
}