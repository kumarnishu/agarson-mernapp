import { DropDownDto } from "./DropDownDto"

export type GetExcelDBRemarksDto = {
    _id: string,
    remark: string,
    next_date: string,
    created_date: string,
    created_by: string,
    category: DropDownDto,
    obj: string

}