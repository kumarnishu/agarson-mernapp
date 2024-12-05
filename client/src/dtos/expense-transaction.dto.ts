import { DropDownDto } from "./dropdown.dto"

export type GetExpenseTransactionDto = {
    _id: string,
    item: DropDownDto,
    category: DropDownDto,
    unit: DropDownDto,
    movement: string,
    from: string,
    to: string,
    qty: number,
    created_by: DropDownDto,
    created_at: string
}