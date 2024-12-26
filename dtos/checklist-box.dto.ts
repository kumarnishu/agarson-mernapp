import { DropDownDto } from "./dropdown.dto";

export type GetChecklistBoxDto = {
    _id: string,
    stage: string,
    score:number,
    last_remark: string,
    checklist: DropDownDto,
    date: string,
}