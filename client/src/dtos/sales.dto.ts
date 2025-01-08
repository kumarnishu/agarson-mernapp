
export type GetSalesExcelDto = {
    _id: string,
    date: string,
    invoice_no: string,
    party: string,
    state: string,
    amount: number,
    status?: string
}
export type GetCollectionsExcelDto = {
    _id: string,
    date: string,
    party: string,
    state: string,
    amount: number,
    status?: string
}
export type GetAgeingExcelDto = {
    _id: string,
    state: string,
    party: string,
    next_call?: string,
    last_remark?: string,
    '25': number,
    '30': number,
    '55': number,
    '60': number,
    '70': number,
    '90': number,
    '120+': number,
    status?: string
}

export type UpdateAgeingRemarkDto={
    _id:string,
    remark:string
}
export type UpdateNextCallRemarkDto={
    _id:string,
    next_call:string
}