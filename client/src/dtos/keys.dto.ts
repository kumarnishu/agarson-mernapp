import { DropDownDto } from "./dropdown.dto";

export type GetKeyDto = {
    _id: string,
    serial_no: number,
    key: string;
    category: DropDownDto;
    type: string;
    is_date_key: boolean,
    map_to_username: boolean,
    map_to_state: boolean,
    assigned_users: string;
}
export type GetKeyFromExcelDto = {
    _id?: string,
    serial_no: number,
    key: string,
    type: string,
    category: string,
    is_date_key: boolean,
    map_to_username: boolean,
    map_to_state: boolean,
    status?: string
}