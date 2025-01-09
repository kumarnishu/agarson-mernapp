export type GetSalesDto = {
    _id: string,
    date: string,
    invoice_no: string,
    party: string,
    month: string,
    state: string,
    amount: number
}

export type GetSalesExcelDto = {
    _id: string,
    date: string,
    invoice_no: string,
    party: string,
    state: string,
    amount: number,
    status?: string
}
export type GetCollectionsDto = {
    _id: string,
    date: string,
    month: string,
    party: string,
    state: string,
    amount: number
}
export type GetCollectionsExcelDto = {
    _id: string,
    date: string,
    party: string,
    state: string,
    amount: number,
    status?: string
}

export type GetAgeingDto = {
    _id: string,
    state: string,
    party: string,
    next_call?: string,
    last_remark?: string,
    two5: number,
    three0: number,
    five5: number,
    six0: number,
    seven0: number,
    seventyplus: number,
}

export type GetAgeingExcelDto = {
    _id: string,
    state: string,
    party: string,
    next_call?: string,
    last_remark?: string,
    two5: number,
    three0: number,
    five5: number,
    six0: number,
    seven0: number,
    seventyplus: number,
    status?: string
}

export type UpdateAgeingRemarkDto = {
    _id: string,
    remark: string
}
export type UpdateNextCallRemarkDto = {
    _id: string,
    next_call: string
}
export type GetAgeingRemarkDto = {
    _id: string,
    remark: string,
    party: string,
    nextcall: string,
    created_at: string,
    created_by: string
}
export type CreateOrEditAgeingRemarkDto = {
    remark: string,
    party: string,
    nextcall: string
}