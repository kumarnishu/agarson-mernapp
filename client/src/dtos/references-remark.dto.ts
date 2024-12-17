export type GetReferenceRemarksDto = {
    _id: string,
    remark: string,
    party:string,
    next_date: string,
    created_date: string,
    created_by: string,

}
export type CreateOrEditReferenceRemarkDto = {
    remark: string,
    party: string,
    stage:string,
    next_date?: string
}
