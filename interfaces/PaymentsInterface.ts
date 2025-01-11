import { IPaymentCategory } from "./DropDownInterface";
import { Asset, IUser } from "./UserController";


export type IPaymentDocument = {
    _id: string,
    remark: string,
    document: Asset,
    payment: IPayment,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


export type IPayment = {
    _id: string,
    active: boolean
    payment_title: string,
    payment_description: string,
    assigned_users: IUser[],
    lastcheckedpayment: IPaymentDocument,
    payment_documents: IPaymentDocument[],
    due_date: Date,
    link: string,
    category: IPaymentCategory,
    frequency?: string,
    next_date: Date,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

