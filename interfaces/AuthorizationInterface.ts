import { IUser } from "./UserController"

export type ICRMCity = {
    _id: string,
    city: string,
    alias1: string,
    alias2: string,
    state: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export type ICRMState = {
    _id: string,
    state: string,
    alias1: string,
    alias2: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export type IKeyCategory = {
    _id: string,
    category: string,
    display_name:string,
    skip_bottom_rows:number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export type IKey = {
    _id: string,
    serial_no: number,
    key: string,
    type: string,
    category: IKeyCategory,
    is_date_key: boolean
    map_to_username: boolean
    map_to_state: boolean
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
