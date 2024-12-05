export type GetCrmCityDto = {
    _id: string,
    city: string;
    alias1: string;
    alias2: string;
    state: string;
    assigned_users: string;
}
export type GetCityFromExcelDto = {
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