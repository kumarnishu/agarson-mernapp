import { IMachine, IDye, IDyeLocation } from "./DropDownInterface"
import { IUser, Asset } from "./UserController"

export type IArticle = {
    _id: string,
    name: string,
    active: boolean,
    display_name: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
export type IProduction = {
    _id: string,
    machine: IMachine,
    thekedar: IUser,
    articles: IArticle[],
    manpower: number,
    production: number,
    big_repair: number,
    upper_damage: number,
    small_repair: number,
    date: Date,
    production_hours: number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export type IShoeWeight = {
    _id: string,
    machine: IMachine,
    dye: IDye,
    article: IArticle,
    is_validated: boolean,
    month: number,
    shoe_weight1: number,
    shoe_photo1: Asset,
    weighttime1: Date,
    weighttime2: Date,
    weighttime3: Date,
    upper_weight1: number,
    upper_weight2: number,
    upper_weight3: number,
    shoe_weight2: number,
    shoe_photo2: Asset,
    shoe_weight3: number,
    shoe_photo3: Asset,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export type ISoleThickness = {
    _id: string,
    dye: IDye,
    article: IArticle,
    size: string,
    left_thickness: number,
    right_thickness: number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


export type ISpareDye = {
    _id: string,
    dye: IDye,
    repair_required: boolean,
    dye_photo: Asset,
    remarks: string,
    is_validated: boolean,
    photo_time: Date,
    location: IDyeLocation,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
