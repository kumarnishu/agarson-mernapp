import { ICRMCity } from "./AuthorizationInterface"
import { IUser, Asset } from "./UserInterface"

export type ILeave = {
    _id: string,
    status: string,
    leave_type: string,//sl,fl,sw,cl
    leave: number,
    yearmonth: number,
    employee: IUser,
    created_at: Date,
    photo:Asset
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export type ISalesAttendance = {
    _id: string,
    employee: IUser,
    date: Date,
    attendance: string,
    is_sunday_working:boolean,
    new_visit: number,
    old_visit: number,
    remark: string,
    in_time: string,
    end_time: string,
    station: ICRMCity,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
