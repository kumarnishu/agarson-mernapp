import { IUser } from "./UserInterface";


export type IConsumedStock = {
    _id: string,
    rejected: boolean,
    party: string,
    scheme: IStockScheme,
    size: number,//six,seven,eight,nine,ten
    article: string,
    consumed: number
    employee: IUser,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export type IStockScheme = {
    _id: string,
    scheme: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export type IArticleStock = {
    _id: string,
    six: number,
    scheme:IStockScheme,
    seven: number,
    eight: number,
    nine: number,
    ten: number,
    eleven:number,
    article: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
