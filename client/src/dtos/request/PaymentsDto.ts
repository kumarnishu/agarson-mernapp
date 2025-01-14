//Request dto

export type CreateOrEditPaymentDocumentDto = {
    remark: string,
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
export type CreatePaymentsFromExcelDto = {
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