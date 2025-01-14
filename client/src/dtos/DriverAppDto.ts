import { DropDownDto } from "./DropDownDto"


//Response dto

export type GetDriverSystemDto = {
    _id: string,
    driver: DropDownDto
    photo: string,
    location:string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}

//Request dto
export type CreateDriverSystemDto = {
    latitude:string,
    longitude:string
    photo:string
}
