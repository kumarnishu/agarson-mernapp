import { DropDownDto } from "./DropDownDto"


//Response dto
export type GetPaymentDto = {
    _id: string,
    active: boolean
    payment_title: string,
    payment_description: string,
    last_document?: GetPaymentDocumentDto,
    assigned_users: DropDownDto[],
    link: string,
    category: DropDownDto,
    frequency?: string,
    due_date: string,
    next_date: string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}
export type GetPaymentDocumentDto = {
    _id: string,
    document: string,
    remark: string,
    payment: DropDownDto,
    date: string,
}
