import { CreateOrEditBillItemDto } from "./bill-item.dto"
import { DropDownDto } from "./dropdown.dto"

export type GetBillDto = {
    _id: string,
    items: CreateOrEditBillItemDto[],
    lead?: DropDownDto,
    billphoto: string,
    refer?: DropDownDto,
    bill_no: string,
    bill_date: string,
    remarks: string,
    created_at: Date,
    updated_at: Date,
    created_by: DropDownDto,
    updated_by: DropDownDto

}
export type CreateOrEditBillDto = {
    items: CreateOrEditBillItemDto[],
    lead: string,
    billphoto: string,
    remarks: string,
    refer: string,
    bill_no: string,
    bill_date: string,
}