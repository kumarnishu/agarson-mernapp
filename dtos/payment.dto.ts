import { DropDownDto } from "./dropdown.dto"
import { GetPaymentDocumentDto } from "./payment-document.dto"

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
export type CreateOrEditPaymentDto = {
    payment_title: string,
    payment_description: string,
    category: string,
    link: string,
    duedate: string,
    assigned_users: string[]
    frequency: string,
}
export type GetPaymentsFromExcelDto = {
    _id?: string,
    payment_title: string,
    payment_description: string,
    category: string,
    link: string,
    assigned_users: string
    frequency?: string,
    duedate: string,
    status?: string
}