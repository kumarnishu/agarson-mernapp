import { ISampleSystem } from "./PartyPageInterface"
import { IUser } from "./UserInterface"

export type ISampleSystemRemark = {
    _id: string,
    remark: string,
    next_call: Date,
    sample:ISampleSystem,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
