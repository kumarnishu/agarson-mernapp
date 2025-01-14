//Request dto

export type CreateExpenseItemFromExcelDto = {
    _id: string,
    item: string,
    unit: string,
    price: number,
    stock_limit: number,
    pricetolerance: number,
    category: string,
    to_maintain_stock: boolean,
    stock: number,
    status?: string
}
export type CreateOrEditExpenseItemDto = {
    item: string,
    unit: string;
    stock: number,
    price: number,
    pricetolerance: number,
    stock_limit: number,
    to_maintain_stock: boolean,
    category: string,
}

export type IssueOrAddExpenseItemDto = {
    stock: number,
    price:number,
    remark:string,
    location: string,
}


