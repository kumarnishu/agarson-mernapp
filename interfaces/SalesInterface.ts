import { IUser } from "./UserController";

export type IAgeingRemark = {
    _id: string,
    remark: string,
    next_call: Date,
    party: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export type IAgeing = {
    _id: string,
    state: string,
    party: string,
    next_call: Date,
    last_remark: string,
    two5: number,
    three0: number,
    five5: number,
    six0: number,
    seven0: number,
    seventyplus: number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


export type ICollection = {
    _id: string,
    date: Date,
    party: string,
    state: string,
    amount:number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export type ILeaveBalance = {
    _id: string,
    sl: number,
    fl: number,
    sw: number,
    cl: number,
    yearmonth: number,
    employee: IUser,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


export type IReferenceRemark = {
    _id: string,
    party: string,
    reference: string,
    remark: string,
    next_call: Date,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export type IReference = {
    _id: string,
    gst: string,
    date: Date,
    party: string,
    stage: string,
    next_call: Date,
    last_remark: string,
    address: string,
    state: string,
    pincode: number,
    business: string,
    sale_scope: number,
    reference: string
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export type ISales = {
    _id: string,
    date: Date,
    invoice_no: string,
    party: string,
    state: string,
    amount:number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export type IVisitRemark = {
    _id: string,
    remark: string,
    employee: IUser,
    visit_date: Date,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


export type IVisitReport = {
    _id: string,
    employee: IUser
    visit_date: Date,
    customer: string,
    intime: number,
    outtime: number,
    visitInLocation: string,
    visitOutLocation: string,
    remarks: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser,
    status?: string
}