import { GetAgeingDto, IColumnRowData } from "./SalesDto"

export type last5remarks = GetPartyRemarkDto[]
export type forcast_growth = IColumnRowData
export type pendingorder = IColumnRowData
export type ageingreport1 = GetAgeingDto[]
export type ageingreport2 = IColumnRowData
export type article_salesforparty = IColumnRowData
export type current_stock = IColumnRowData

export type GetPartyRemarkDto = {
    _id: string,
    remark: string,
    remark_type: string,
    party: string,
    nextcall: string,
    created_at: string,
    created_by: string
}
export type GetPartyAgeingDto={
        _id: string,
        state: string,
        party: string,
        two5: number,
        three0: number,
        five5: number,
        six0: number,
        seven0: number,
        seventyplus: number,
}
export type CreateOrEditPartyRemarkDto = {
    remark: string,
    remark_type: string,
    party: string,
    nextcall?: string
}