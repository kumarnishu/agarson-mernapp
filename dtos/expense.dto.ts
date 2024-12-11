import { DropDownDto } from "./dropdown.dto"

export type IssueOrAddExpenseItemDto = {
    stock: number,
    price:number,
    remark:string,
    location: string,
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
