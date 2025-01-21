import { DropDownDto } from "./DropDownDto"
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
    party: string,
    nextcall: string,
    created_at: string,
    created_by: DropDownDto
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
    party: string,
    nextcall?: string
}

export type PartyListDto={ party: string, state: string }

export type GetSampleSystemDto={
    _id:string,
    date:string,
    party:string,
    state:string,
    samples:string,
    last_remark:string,
    next_call:string,
    stage:string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type CreateOrEditSampleSystemDto={
    date:string,
    party:string,
    state:string,
    samples:string,
    stage:string
}