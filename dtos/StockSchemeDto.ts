import { DropDownDto } from "./DropDownDto"


//Response dto
export type GetConsumedStockDto = {
    _id: string,
    party: string,
    status:string,
    article: string,
    scheme:DropDownDto,
    size: number,
    consumed: number,
    employee: DropDownDto,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type GetArticleStockDto = {
    _id: string,
    scheme:DropDownDto,
    article: string,
    six: number,
    seven: number,
    eight: number,
    nine: number,
    ten: number,
    eleven: number,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type CreateConsumeStockDto = {
    scheme:string,
    party:string,
    article: string,
    size: number,
    consumed: number
}
export type DiscardConsumptionDto = {
    scheme:string,
    article: string,
    size: number,
    consumed: number
}
export type CreateArticleStockExcelDto = {
    article: string,
    scheme?: string,
    six: number,
    seven: number,
    eight: number,
    nine: number,
    ten: number,
    eleven: number,
    status?: string
}