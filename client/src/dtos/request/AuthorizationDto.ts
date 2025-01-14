
//Request dto
export type CreateKeyFromExcelDto = {
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
export type CreateCityFromExcelDto = {
    _id: string,
    city: string,
    status?: string
}
export type CreateOrEditCrmCity = {
    _id: string,
    state: string,
    alias1: string;
    alias2: string;
    city: string
}