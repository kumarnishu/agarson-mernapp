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