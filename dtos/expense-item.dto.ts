import { DropDownDto } from "./dropdown.dto";

export type GetExpenseItemDto = {
    _id: string,
    item: string;
    price: number,
    pricetolerance: number,
    qtytolerance: number,
    category: DropDownDto,
    unit: DropDownDto;
    to_maintain_stock: boolean,
    stock: number,
    last_remark: string
}

export type GetExpenseItemFromExcelDto = {
    _id: string,
    item: string,
    unit: string,
    price: number,
    qtytolerance: number,
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
    qtytolerance: number,
    to_maintain_stock: boolean,
    category: string,
}
