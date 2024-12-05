import { DropDownDto } from "./dropdown.dto"

export type GetPaymentDocumentDto = {
    _id: string,
    document: string,
    remark: string,
    payment: DropDownDto,
    date: string,
}
export type CreateOrEditPaymentDocumentDto = {
    remark: string,
}