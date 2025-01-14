import { DropDownDto } from "../response/DropDownDto"


//Response dto
export type CreateExcelDBRemarksDto = {
    _id: string,
    remark: string,
    next_date: string,
    created_date: string,
    created_by: string,
    category: DropDownDto,
    obj: string

}
export type CreateOrEditExcelDbRemarkDto = {
    remark: string,
    category: string,
    obj: string,
    next_date?: string
}