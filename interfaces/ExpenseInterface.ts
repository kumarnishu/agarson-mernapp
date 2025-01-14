import { IItemUnit } from "./DropDownInterface"
import { IUser } from "./UserInterface"


export type IExpenseCategory = {
    _id: string,
    category: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}



export type IExpenseItem = {
    _id: string,
    item: string,
    unit: IItemUnit,
    stock: number,
    last_remark: string,
    to_maintain_stock: boolean,
    price: number,
    pricetolerance: number,
    stock_limit: number,
    category: IExpenseCategory
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


export type IExpenseLocation = {
    _id: string,
    name: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}



export type IExpenseTransaction = {
    _id: string,
    item: IExpenseItem,
    location: IExpenseLocation,
    remark: string,
    inWardQty: number,
    outWardQty: number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


