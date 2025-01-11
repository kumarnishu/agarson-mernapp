import { DropDownDto } from "./DropDownDto";

//Response dto

export type GetCrmCityDto = {
    _id: string,
    city: string;
    alias1: string;
    alias2: string;
    state: string;
    assigned_users: string;
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
export type GetCrmStateDto = {
    _id: string,
    state: string,
    alias1: string,
    alias2: string,
    assigned_users: string;
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

//Request dto
export type CreateKeyFromExcelDto = {
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
export type CreateCityFromExcelDto = {
    _id: string,
    city: string,
    status?: string
}
export type CreateOrEditCrmCity = {
    _id: string,
    state: string,
    alias1: string;
    alias2: string;
    city: string
}