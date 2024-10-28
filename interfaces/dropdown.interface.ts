import { IUser } from "./feature.interface"


export interface ICRMCity {
    _id: string,
    city: string,
    state: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
export interface ILeadType {
    _id: string,
    type: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
export interface ILeadSource {
    _id: string,
    source: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
export interface IStage {
    _id: string,
    stage: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
export interface ICRMState {
    _id: string,
    state: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}



export interface IArticle {
    _id: string,
    name: string,
    active: boolean,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
export interface IMachineCategory {
    _id: string,
    category: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
export interface IDyeLocation {
    _id: string,
    name: string,
    active: boolean,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
export interface IDye {
    _id: string,
    active: boolean,
    dye_number: number,
    size: string,
    articles: IArticle[],
    stdshoe_weight: number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
export interface IMachine {
    _id: string,
    name: string,
    active: boolean,
    category: string,
    serial_no: number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
export interface IState {
    _id: string,
    state: string,
    apr: number,
    may: number,
    jun: number,
    jul: number,
    aug: number,
    sep: number,
    oct: number,
    nov: number,
    dec: number,
    jan: number,
    feb: number,
    mar: number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
export interface IErpEmployee {
    _id: string,
    name: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export interface IChecklistCategory {
    _id: string,
    category: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export interface IMaintenanceCategory {
    _id: string,
    category: string,
    active: boolean,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
