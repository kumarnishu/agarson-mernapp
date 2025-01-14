
//Request dto
export type CreateOrEditArticleDto = {
    name: string, display_name: string
}
export type CreateOrEditDyeLocationDto = {
    name: string, display_name: string
}
export type CreateOrEditDyeDTo = {
    dye_number: number,
    size: string,
    articles: string[],
    st_weight: number
}
export type CreateDyeDtoFromExcel = {
    dye_number: number,
    size: string,
    articles: string,
    st_weight: number
}
export type CreateOrEditMachineDto = {
    name: string,
    display_name: string,
    serial_no: number,
    category: string
}

