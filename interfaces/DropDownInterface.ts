import { IArticle } from "./ProductionInterface";
import { IUser } from "./UserController";
export type IChecklistCategory = {
    _id: string,
    category: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


export type ILeadType = {
    _id: string,
    type: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export type ILeadSource = {
    _id: string,
    source: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


export type IStage = {
    _id: string,
    stage: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export type IDyeLocation = {
    _id: string,
    name: string,
    active: boolean,
    display_name: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


export type IDye = {
    _id: string,
    active: boolean,
    dye_number: number,
    size: string,
    articles:IArticle[],
    stdshoe_weight:number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}



export type IItemUnit = {
    _id: string,
    unit: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}



export type IMachineCategory = {
    _id: string,
    category: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


export type IMachine = {
    _id: string,
    name: string,
    active: boolean,
    category: string,
    serial_no: number,
    display_name: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}



export type IPaymentCategory = {
    _id: string,
    category: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

