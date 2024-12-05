import { DropDownDto } from "./dropdown.dto"

export type GetBillItemDto = {
    _id: string,
    article: DropDownDto,
    qty: number,
    rate: number,
    bill: DropDownDto,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto

}
export type CreateOrEditBillItemDto = {
    _id?: string,
    article: string,
    qty: number,
    rate: number,
}
