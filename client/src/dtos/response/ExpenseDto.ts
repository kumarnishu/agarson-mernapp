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