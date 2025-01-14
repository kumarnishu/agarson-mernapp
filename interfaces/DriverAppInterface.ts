import { Asset, IUser } from "./UserInterface"

export type IDriverSystem = {
    _id: string,
    driver: IUser
    location: string,
    photo: Asset,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
