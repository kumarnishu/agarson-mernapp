import { DropDownDto } from "./dropdown.dto"

export type GetStockSchemeConsumedDto = {
    _id: string,
    party: string,
    article: string,
    size: number,
    consumed: number,
    employee: DropDownDto,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}

export type ConsumeStockSchemeDto = {
    party:string,
    article: string,
    size: number,
    consumed: number
}


export type GetStockSchemeDto = {
    _id: string,
    article: string,
    six: number,
    seven: number,
    eight: number,
    nine: number,
    ten: number,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}

export type getStockSchemeExcelDto = {
    article: string,
    six: number,
    seven: number,
    eight: number,
    nine: number,
    ten: number,
    status?: string
}