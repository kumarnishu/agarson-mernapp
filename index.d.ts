import { IUser } from "./models/features/user.model";

declare  global {
    namespace Express {
        export interface Request {
            user: IUser | null
        }
    }
}