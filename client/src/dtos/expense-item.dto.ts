import { DropDownDto } from "./dropdown.dto";

export type GetExpenseItemDto = {
    _id: string,
    item: string;
    category: DropDownDto,
    unit: DropDownDto;
    to_maintain_stock: boolean,
    stock: number
}
export type GetExpenseItemFromExcelDto = {
    _id: string,
    item: string,
    unit: string,
    category: string,
    to_maintain_stock: boolean,
    stock: number,
    status?: string
}
export type CreateOrEditExpenseItem = {
    item: string,
    unit: string;
    stock: number,
    to_maintain_stock: boolean,
    category: string
}