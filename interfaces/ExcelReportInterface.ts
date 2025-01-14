import { IKeyCategory, IKey } from "./AuthorizationInterface";
import { IUser } from "./UserInterface";


export type IExcelDBRemark = {
    _id: string,
    remark: string,
    category:IKeyCategory,
    obj:string,
    created_at: Date,
    next_date:Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


export type IExcelDb = {
    key: IKey,
    category: IKeyCategory
} & {}

