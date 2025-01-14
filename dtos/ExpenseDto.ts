import { DropDownDto } from "./DropDownDto";


//Response dto
export type GetExpenseItemDto = {
    _id: string,
    item: string;
    price: number,
    pricetolerance: number,
    stock_limit: number,
    category: DropDownDto,
    unit: DropDownDto;
    to_maintain_stock: boolean,
    stock: number,
    last_remark: string
}
export type GetExpenseTransactionsDto = {
    _id: string,
    item: DropDownDto,
    unit:DropDownDto,
    category:DropDownDto,
    location: DropDownDto,
    remark: string,
    inWardQty: number,
    outWardQty: number,
    price:number,
    created_at: string,
    created_by: DropDownDto
}
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


